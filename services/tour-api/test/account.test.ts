import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/clients/sms', () => ({
  sendSms: vi.fn(async () => ({ provider: 'test', providerId: 'p1' })),
  smsProvider: () => 'test',
  callWithCode: vi.fn(async () => 'voice'),
}));
vi.mock('../src/clients/email', () => ({ sendEmail: vi.fn(async () => undefined), emailProvider: () => 'test', maskEmail: (e: string) => e }));
const verifyIdToken = vi.fn();
vi.mock('google-auth-library', () => ({ OAuth2Client: vi.fn(() => ({ verifyIdToken })) }));

import { sendEmail } from '../src/clients/email';
import { callWithCode, sendSms, type Sms } from '../src/clients/sms';
import { env } from '../src/config/env';
import { prisma } from '../src/lib/prisma';
import { invalidateCache } from '../src/services/cacheService';
import { api, auth, resetUsers, signUp } from './helpers';

const sms = vi.mocked(sendSms);
const mail = vi.mocked(sendEmail);
const lastCode = () => {
  const body = (sms.mock.calls.at(-1)?.[0] as Sms).body;
  return body.match(/^(\d{6}) is your Pune Explorer login code/)![1];
};
const PHONE = '98765 43210';

beforeEach(async () => {
  await resetUsers();
  await invalidateCache('tour:*');
  sms.mockClear();
  mail.mockClear();
  verifyIdToken.mockReset();
});

describe('mobile OTP', () => {
  it('creates an account on first verify, logs in afterwards', async () => {
    const send = await api().post('/api/v1/auth/otp/send').send({ phone: PHONE });
    expect(send.status).toBe(200);
    expect(send.body.data).toMatchObject({ sent: true, channel: 'sms', resendIn: 30 });
    expect(send.body.data.devCode).toBeUndefined(); // never outside a developer's console mode
    const sent = sms.mock.calls[0][0] as Sms;
    expect(sent).toMatchObject({ kind: 'otp', to: '+919876543210' });
    expect(sent.logBody).not.toMatch(/\d{6}/);
    expect(sent.body).toMatch(/#\d{6}$/); // Web OTP autofill line

    // Stored only as an HMAC
    const row = await prisma.otpCode.findFirstOrThrow();
    expect(row.codeHash).not.toContain(lastCode());

    const v = await api().post('/api/v1/auth/otp/verify').set('X-Client', 'native').send({ phone: PHONE, code: lastCode() });
    expect(v.status).toBe(200);
    expect(v.body.data.isNewUser).toBe(true);
    expect(v.body.data.user).toMatchObject({ phone: '+919876543210', phoneVerified: true, name: '', termsAccepted: false });

    // "Almost there": name + consent
    const done = await api().patch('/api/v1/users/me').set(auth(v.body.data.accessToken)).send({ name: 'Sourav', acceptTerms: true });
    expect(done.body.data).toMatchObject({ name: 'Sourav', termsAccepted: true });

    // Next time: same account, not new
    await invalidateCache('tour:otp:*');
    await api().post('/api/v1/auth/otp/send').send({ phone: '+91 98765 43210' });
    const again = await api().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: lastCode() });
    expect(again.body.data).toMatchObject({ isNewUser: false, user: { name: 'Sourav' } });
    expect(await prisma.user.count()).toBe(1);
  });

  it('enforces the 30-second resend wait, voice calls, and validation', async () => {
    expect((await api().post('/api/v1/auth/otp/send').send({ phone: '12345' })).status).toBe(400);
    await api().post('/api/v1/auth/otp/send').send({ phone: PHONE });
    const soon = await api().post('/api/v1/auth/otp/send').send({ phone: PHONE });
    expect(soon.status).toBe(429);
    expect(soon.body.error.code).toBe('OTP_COOLDOWN');
    await invalidateCache('tour:otp:cool:*');
    const call = await api().post('/api/v1/auth/otp/send').send({ phone: PHONE, channel: 'voice' });
    expect(call.body.data.channel).toBe('voice');
    expect(callWithCode).toHaveBeenCalled();
  });

  it('locks a code after 5 wrong tries and rejects expired codes', async () => {
    await api().post('/api/v1/auth/otp/send').send({ phone: PHONE });
    const good = lastCode();
    const wrong = good === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      const r = await api().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: wrong });
      expect(r.body.error.code).toBe('OTP_WRONG');
    }
    const locked = await api().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: good });
    expect(locked.status).toBe(429);
    // The right code no longer works after the lock
    expect((await api().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: good })).body.error.code).toBe('OTP_EXPIRED');

    await invalidateCache('tour:otp:*');
    await api().post('/api/v1/auth/otp/send').send({ phone: PHONE });
    await prisma.otpCode.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await api().post('/api/v1/auth/otp/verify').send({ phone: PHONE, code: lastCode() })).body.error.code).toBe('OTP_EXPIRED');
  });
});

describe('Google sign-in', () => {
  const token = 'x'.repeat(200);

  it('is reported as not set up without a client id', async () => {
    const saved = env.GOOGLE_CLIENT_ID;
    (env as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID = undefined;
    const r = await api().post('/api/v1/auth/google').send({ idToken: token });
    expect(r.status).toBe(503);
    expect(r.body.error.code).toBe('GOOGLE_NOT_CONFIGURED');
    (env as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID = saved;
  });

  it('creates an account, then logs the same person in; links by verified email only', async () => {
    (env as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g-1', email: 'Asha@Example.com', email_verified: true, name: 'Asha Patil' }) });
    const first = await api().post('/api/v1/auth/google').send({ idToken: token });
    expect(first.body.data).toMatchObject({ isNewUser: true, user: { name: 'Asha Patil', email: 'asha@example.com', hasGoogle: true, termsAccepted: true } });
    const second = await api().post('/api/v1/auth/google').send({ idToken: token });
    expect(second.body.data.isNewUser).toBe(false);

    // Existing email account + Google with the same verified email → linked, not duplicated
    const u = await signUp({ email: 'meera@example.com' });
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g-2', email: 'meera@example.com', email_verified: true, name: 'Meera' }) });
    const linked = await api().post('/api/v1/auth/google').send({ idToken: token });
    expect(linked.body.data.user.id).toBe(u.user.id);

    // Unverified email never links to someone else's account
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g-3', email: 'meera@example.com', email_verified: false, name: 'Fake' }) });
    const unverified = await api().post('/api/v1/auth/google').send({ idToken: token });
    expect(unverified.body.data.user.id).not.toBe(u.user.id);
    expect(unverified.body.data.user.email).toBeNull();

    verifyIdToken.mockRejectedValue(new Error('bad signature'));
    expect((await api().post('/api/v1/auth/google').send({ idToken: token })).body.error.code).toBe('GOOGLE_TOKEN_INVALID');
  });
});

describe('password reset', () => {
  const linkToken = () => {
    const text = mail.mock.calls.at(-1)![0].text;
    return text.match(/\/reset\?token=([A-Za-z0-9_-]+)/)![1];
  };

  it('answers the same for unknown emails and sends nothing', async () => {
    const r = await api().post('/api/v1/auth/password/forgot').send({ email: 'nobody@example.com' });
    expect(r.status).toBe(200);
    expect(r.body.data).toEqual({ sent: true });
    expect(mail).not.toHaveBeenCalled();
  });

  it('emails a one-time link that sets a new password and signs out every session', async () => {
    const u = await signUp({ email: 'reset@example.com', password: 'Old-password-1' });
    await api().post('/api/v1/auth/password/forgot').send({ email: 'reset@example.com' });
    expect(mail).toHaveBeenCalledTimes(1);
    const token = linkToken();
    const row = await prisma.passwordReset.findFirstOrThrow();
    expect(row.tokenHash).not.toBe(token);

    expect((await api().post('/api/v1/auth/password/reset').send({ token, password: 'short' })).status).toBe(400);
    const ok = await api().post('/api/v1/auth/password/reset').send({ token, password: 'New-password-2' });
    expect(ok.body.data).toEqual({ reset: true });

    // Old refresh cookie is dead, old password fails, new one works
    const refresh = await api().post('/api/v1/auth/refresh').set('Cookie', u.cookie);
    expect(refresh.status).toBe(401);
    expect((await api().post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'Old-password-1' })).status).toBe(401);
    expect((await api().post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'New-password-2' })).status).toBe(200);

    // The link works once
    const replay = await api().post('/api/v1/auth/password/reset').send({ token, password: 'Another-pass-3' });
    expect(replay.body.error.code).toBe('RESET_INVALID');
  });

  it('a newer link replaces the older one, and links expire', async () => {
    await signUp({ email: 'twice@example.com' });
    await api().post('/api/v1/auth/password/forgot').send({ email: 'twice@example.com' });
    const first = linkToken();
    await api().post('/api/v1/auth/password/forgot').send({ email: 'twice@example.com' });
    const second = linkToken();
    expect((await api().post('/api/v1/auth/password/reset').send({ token: first, password: 'New-password-2' })).status).toBe(400);
    await prisma.passwordReset.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await api().post('/api/v1/auth/password/reset').send({ token: second, password: 'New-password-2' })).status).toBe(400);
  });
});
