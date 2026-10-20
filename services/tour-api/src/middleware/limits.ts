import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env';
import { SharedStore } from './rateLimitStore';

const handler: Options['handler'] = (_req, res) =>
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait and try again.' } });

// The API test suite sends every request from one address; it opts in to limits per request.
const skipInTests = (req: Request) => env.isTest && req.get('X-Test-Rate-Limit') !== 'on';

const make = (name: string, windowMs: number, limit: number, key?: (req: Request, res: Response) => string) =>
  rateLimit({
    windowMs,
    limit,
    store: new SharedStore(name),
    skip: skipInTests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler,
    ...(key ? { keyGenerator: key } : {}),
  });

const ipKey = (req: Request) => req.ip ?? 'unknown';
const field = (name: string) => (req: Request) => `${ipKey(req)}:${String(req.body?.[name] ?? '').toLowerCase()}`;

/** Login: 5/min per IP + email (TECH_DESIGN §8). */
export const loginLimit = make('login', 60_000, 5, field('email'));
/** Sign-ups per IP: generous because many phones share a carrier IP (CGNAT). */
export const registerLimit = make('register', 15 * 60_000, 30);
/** OTP: max 5 sends/hour per phone (30-s cooldown is enforced in the service). */
export const otpSendLimit = make('otp-send', 60 * 60_000, 5, field('phone'));
/** Code checks per IP + phone (the service also locks a code after 5 wrong tries). */
export const otpVerifyLimit = make('otp-verify', 15 * 60_000, 20, field('phone'));
export const googleLimit = make('google', 60_000, 20);
export const resetSubmitLimit = make('pw-reset-submit', 60 * 60_000, 20);
export const passwordResetLimit = make('pw-reset', 60 * 60_000, 5, field('email'));
/**
 * Session refresh runs on every app open. Limited per session (the refresh token, hashed by the
 * store), so thousands of people behind one carrier IP are never logged out by each other;
 * a high per-IP ceiling still stops floods of refreshes with made-up tokens.
 */
const refreshPerSession = make('refresh', 60_000, 30, (req) => {
  const token = (req.cookies?.pe_rt as string | undefined) ?? (typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '');
  return token ? `rt:${token}` : `ip:${ipKey(req)}`;
});
const refreshPerIp = make('refresh-ip', 60_000, 1000);
export const refreshLimit = [refreshPerIp, refreshPerSession];
/**
 * SOS must never be refused because of someone else: logged-in users are limited per account,
 * guests per IP (generous, since many phones share a carrier IP). Bounds SMS abuse, not safety.
 * Mount after optionalAuth.
 */
export const sosLimit = make('sos', 10 * 60_000, 30, (req, res) => (res.locals.userId ? `u:${res.locals.userId}` : `ip:${ipKey(req)}`));
/** Test alerts: the real cap is 3 per user per day (service); this bounds one IP (CGNAT-friendly). */
export const testAlertLimit = make('test-alert', 24 * 60 * 60_000, 20);
/** Contact changes and live-trip sharing (each share texts every contact). */
export const contactsWriteLimit = make('contacts-write', 60 * 60_000, 60);
export const tripShareLimit = make('trip-share', 60 * 60_000, 10);
/** "Mark as visited" from the Place screen, per account (XP is awarded once per place anyway). */
export const visitLimit = make('visit', 60 * 60_000, 60, (req, res) => `u:${res.locals.userId ?? ipKey(req)}`);

/** Avatar uploads are CPU work (image re-encode). */
export const avatarLimit = make('avatar', 60 * 60_000, 20);

/** Account deletion: rare by nature; stops a stolen token being used to probe it. */
export const deleteAccountLimit = make('delete-account', 60 * 60_000, 5);

/** Directions and Optimise spend the routing provider's quota. Live navigation re-routes occasionally. */
export const routingLimit = make('routing', 60_000, 30);
export const optimiseLimit = make('optimise', 10 * 60_000, 20);

/**
 * Whole-API ceiling per IP. Generous on purpose: Indian mobile carriers put many
 * users behind one CGNAT address, so the tight limits stay on the sensitive routes above.
 */
export const apiLimit = rateLimit({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new SharedStore('api'),
  skip: () => !env.isProd,
  handler,
});
