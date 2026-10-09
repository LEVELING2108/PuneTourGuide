import rateLimit, { type Options } from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env';
import { SharedStore } from './rateLimitStore';

const handler: Options['handler'] = (_req, res) =>
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait and try again.' } });

const make = (name: string, windowMs: number, limit: number, key?: (req: Request) => string) =>
  rateLimit({
    windowMs,
    limit,
    store: new SharedStore(name),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler,
    ...(key ? { keyGenerator: key } : {}),
  });

const ipKey = (req: Request) => req.ip ?? 'unknown';
const field = (name: string) => (req: Request) => `${ipKey(req)}:${String(req.body?.[name] ?? '').toLowerCase()}`;

/** Login: 5/min per IP + email (TECH_DESIGN §8). */
export const loginLimit = make('login', 60_000, 5, field('email'));
export const registerLimit = make('register', 15 * 60_000, 10);
/** OTP: max 5 sends/hour per phone (30-s cooldown is enforced in the service). */
export const otpSendLimit = make('otp-send', 60 * 60_000, 5, field('phone'));
export const otpVerifyLimit = make('otp-verify', 15 * 60_000, 20);
export const passwordResetLimit = make('pw-reset', 60 * 60_000, 5, field('email'));
export const refreshLimit = make('refresh', 60_000, 30);
/** SOS alerts must not be blocked by mistake: generous but bounded. */
export const sosLimit = make('sos', 10 * 60_000, 10);
/** Test alerts: 3 per day per IP (also enforced per user in the service). */
export const testAlertLimit = make('test-alert', 24 * 60 * 60_000, 3);

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
