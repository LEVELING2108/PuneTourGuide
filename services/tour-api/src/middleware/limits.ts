import rateLimit, { type Options } from 'express-rate-limit';
import type { Request } from 'express';

const handler: Options['handler'] = (_req, res) =>
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait and try again.' } });

const make = (windowMs: number, limit: number, key?: (req: Request) => string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler,
    ...(key ? { keyGenerator: key } : {}),
  });

const ipKey = (req: Request) => req.ip ?? 'unknown';
const field = (name: string) => (req: Request) => `${ipKey(req)}:${String(req.body?.[name] ?? '').toLowerCase()}`;

/** Login: 5/min per IP + email (TECH_DESIGN §8). */
export const loginLimit = make(60_000, 5, field('email'));
export const registerLimit = make(15 * 60_000, 10);
/** OTP: max 5 sends/hour per phone (30-s cooldown is enforced in the service). */
export const otpSendLimit = make(60 * 60_000, 5, field('phone'));
export const otpVerifyLimit = make(15 * 60_000, 20);
export const passwordResetLimit = make(60 * 60_000, 5, field('email'));
export const refreshLimit = make(60_000, 30);
/** SOS alerts must not be blocked by mistake: generous but bounded. */
export const sosLimit = make(10 * 60_000, 10);
/** Test alerts: 3 per day per IP (also enforced per user in the service). */
export const testAlertLimit = make(24 * 60 * 60_000, 3);
