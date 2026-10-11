import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../lib/tokens';

const bearer = (req: Request) => {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
};

/** userId comes only from the verified token, never from the body or URL. */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = bearer(req);
  const payload = token ? verifyAccessToken(token) : null;
  if (!payload) return next(unauthorized('TOKEN_INVALID', 'Please log in to continue'));
  res.locals.userId = payload.sub;
  next();
};

/** Works with or without a token (guest mode). */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = bearer(req);
  const payload = token ? verifyAccessToken(token) : null;
  res.locals.userId = payload?.sub ?? null;
  next();
};

export const userId = (res: Response): number => res.locals.userId as number;
export const maybeUserId = (res: Response): number | null => (res.locals.userId as number | null) ?? null;
