import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { emailProvider, sendEmail } from '../../clients/email';
import { callWithCode, smsProvider } from '../../clients/sms';
import { env } from '../../config/env';
import { randomCode, randomToken, sha256 } from '../../lib/crypto';
import { AppError, badRequest, tooMany } from '../../lib/errors';
import { toE164 } from '../../lib/phone';
import { getCachedData, setCachedData, sharedRedis } from '../../services/cacheService';
import { otpSms } from '../notify/messages';
import { enqueueSms } from '../notify/sms.queue';
import { usersRepo } from '../users/users.repository';
import { otpRepo, resetRepo } from './auth.repository';
import { authService, BCRYPT_COST } from './auth.service';

const OTP_TTL_MS = 5 * 60_000;
const OTP_COOLDOWN_S = 30;
const OTP_PER_HOUR = 5;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TTL_MS = 30 * 60_000;

/** Only on a developer's machine with no SMS/email provider: hand the secret back so the flow can be tried. */
const devEcho = (provider: string) => env.NODE_ENV === 'development' && provider === 'console';

/** Codes are stored as HMAC(phone:code) with a server secret, so a database leak cannot be brute-forced offline. */
const codeHash = (phone: string, code: string) => crypto.createHmac('sha256', env.JWT_SECRET).update(`${phone}:${code}`).digest('hex');

const phoneOrThrow = (raw: string) => {
  const p = toE164(raw);
  if (!p) throw badRequest('PHONE_INVALID', 'Enter a valid 10-digit mobile number');
  return p;
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Per-phone counter shared by every instance (Redis); memory cache when Redis is down. */
async function bump(key: string, ttlS: number) {
  const redis = sharedRedis();
  if (redis) {
    try {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, ttlS);
      return n;
    } catch {
      // fall through
    }
  }
  const n = ((await getCachedData<number>(key)) ?? 0) + 1;
  await setCachedData(key, n, ttlS);
  return n;
}

/** true if the cooldown was free (and is now taken). */
async function takeCooldown(key: string, ttlS: number) {
  const redis = sharedRedis();
  if (redis) {
    try {
      return (await redis.set(key, '1', 'EX', ttlS, 'NX')) === 'OK';
    } catch {
      // fall through
    }
  }
  if (await getCachedData(key)) return false;
  await setCachedData(key, 1, ttlS);
  return true;
}

let google: OAuth2Client | null = null;

export const accountService = {
  /** Send a 6-digit login code by SMS (or a voice call). Same answer whether or not the number has an account. */
  async sendOtp(rawPhone: string, channel: 'sms' | 'voice') {
    const phone = phoneOrThrow(rawPhone);
    const tag = sha256(phone).slice(0, 24);
    if (!(await takeCooldown(`tour:otp:cool:${tag}`, OTP_COOLDOWN_S))) {
      throw new AppError(429, 'OTP_COOLDOWN', `Wait ${OTP_COOLDOWN_S} seconds before asking for another code`);
    }
    if ((await bump(`tour:otp:hour:${tag}`, 3600)) > OTP_PER_HOUR) throw tooMany('OTP_LIMIT', 'Too many codes for this number. Try again in an hour.');

    const code = randomCode();
    await otpRepo.replace(phone, codeHash(phone, code), new Date(Date.now() + OTP_TTL_MS));
    let used: 'sms' | 'voice' = 'sms';
    if (channel === 'voice' && (await callWithCode(phone, code).catch(() => 'unavailable' as const)) === 'voice') used = 'voice';
    else await enqueueSms(null, [otpSms(phone, code)]);
    return { sent: true, channel: used, expiresIn: OTP_TTL_MS / 1000, resendIn: OTP_COOLDOWN_S, ...(devEcho(smsProvider()) ? { devCode: code } : {}) };
  },

  /** Check the code; log in, or create the account (isNewUser → "Almost there"). */
  async verifyOtp(rawPhone: string, code: string) {
    const phone = phoneOrThrow(rawPhone);
    const row = await otpRepo.latest(phone);
    if (!row || row.expiresAt < new Date()) throw badRequest('OTP_EXPIRED', 'This code has expired. Ask for a new one.');
    const attempts = await otpRepo.bumpAttempts(row.id);
    if (attempts > OTP_MAX_ATTEMPTS) {
      await otpRepo.clear(phone);
      throw tooMany('OTP_TOO_MANY', 'Too many wrong codes. Ask for a new one.');
    }
    const a = Buffer.from(codeHash(phone, code), 'hex');
    const b = Buffer.from(row.codeHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      const left = OTP_MAX_ATTEMPTS - attempts;
      throw badRequest('OTP_WRONG', left > 0 ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'That code is not right. Ask for a new one.');
    }
    await otpRepo.clear(phone);
    const existing = await usersRepo.findByPhone(phone);
    if (existing) {
      if (!existing.phoneVerified) await usersRepo.update(existing.id, { phoneVerified: true });
      // Someone who stopped at "Almost there" last time goes back there
      return authService.issueSession(existing.id, !existing.name || !existing.termsAcceptedAt);
    }
    const user = await usersRepo.create({ name: '', phone, phoneVerified: true });
    return authService.issueSession(user.id, true);
  },

  /** Google Identity Services ID token → session. Links to an existing account only through a Google-verified email. */
  async google(idToken: string) {
    if (!env.GOOGLE_CLIENT_ID) throw new AppError(503, 'GOOGLE_NOT_CONFIGURED', 'Google sign-in is not set up yet. Use email or mobile.');
    google ??= new OAuth2Client(env.GOOGLE_CLIENT_ID);
    let payload;
    try {
      payload = (await google.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID })).getPayload();
    } catch {
      throw badRequest('GOOGLE_TOKEN_INVALID', 'Google sign-in failed. Try again.');
    }
    if (!payload?.sub) throw badRequest('GOOGLE_TOKEN_INVALID', 'Google sign-in failed. Try again.');
    const email = payload.email_verified && payload.email ? payload.email.toLowerCase() : null;

    const byGoogle = await usersRepo.findByGoogleId(payload.sub);
    if (byGoogle) return authService.issueSession(byGoogle.id);
    if (email) {
      const byEmail = await usersRepo.findByEmail(email);
      if (byEmail) {
        await usersRepo.update(byEmail.id, { googleId: payload.sub });
        return authService.issueSession(byEmail.id);
      }
    }
    const user = await usersRepo.create({
      name: (payload.name ?? payload.given_name ?? '').slice(0, 60),
      email,
      googleId: payload.sub,
      termsAcceptedAt: new Date(), // the screen says "By continuing you accept the Terms"
    });
    return authService.issueSession(user.id, true);
  },

  /**
   * Forgot password: always the same answer (no account enumeration). If the email has an
   * account, a link valid for 30 minutes is emailed; older links stop working.
   */
  async forgotPassword(email: string) {
    const work = async () => {
      const user = await usersRepo.findByEmail(email);
      if (!user) return null;
      const token = randomToken(32);
      await resetRepo.replace(user.id, sha256(token), new Date(Date.now() + RESET_TTL_MS));
      const link = `${env.APP_URL.replace(/\/$/, '')}/reset?token=${token}`;
      await sendEmail({
        to: email,
        subject: 'Reset your Pune Explorer password',
        text: `Hi ${user.name || 'there'},\n\nReset your password with this link (valid for 30 minutes):\n${link}\n\nIf you did not ask for this, ignore this email; your password stays the same.`,
        html: `<p>Hi ${escapeHtml(user.name || 'there')},</p><p><a href="${link}">Reset your password</a> (valid for 30 minutes).</p><p>If you did not ask for this, ignore this email; your password stays the same.</p>`,
      });
      return link;
    };
    if (devEcho(emailProvider()) || env.isTest) {
      const link = await work();
      return { sent: true, ...(devEcho(emailProvider()) && link ? { devLink: link } : {}) };
    }
    // Answer at once, so the response time does not reveal whether the email has an account
    void work().catch(() => undefined);
    return { sent: true };
  },

  /** Set a new password from an emailed link; every existing session is signed out. */
  async resetPassword(token: string, password: string) {
    const row = await resetRepo.byHash(sha256(token));
    if (!row || row.usedAt || row.expiresAt < new Date() || !(await resetRepo.use(row.id))) {
      throw badRequest('RESET_INVALID', 'This link has expired or was already used. Ask for a new one.');
    }
    await usersRepo.update(row.userId, { password: await bcrypt.hash(password, BCRYPT_COST) });
    await authService.revokeAll(row.userId);
    return { reset: true };
  },
};
