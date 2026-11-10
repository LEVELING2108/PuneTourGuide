import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env';

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_COOKIE = 'pe_rt';

export type AccessPayload = { sub: number };

export const signAccessToken = (userId: number) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: ACCESS_TTL_SECONDS });

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'object' && decoded && 'sub' in decoded) {
      const sub = Number((decoded as jwt.JwtPayload).sub);
      return Number.isInteger(sub) ? { sub } : null;
    }
    // Legacy tokens: { id, email }
    if (typeof decoded === 'object' && decoded && 'id' in decoded) return { sub: Number((decoded as any).id) };
    return null;
  } catch {
    return null;
  }
}

/**
 * Refresh token cookie (web). The app and API share one origin (docs/LAUNCH_SETUP.md step 1),
 * so SameSite=Lax: the cookie is never sent on cross-site requests. COOKIE_SAMESITE=none only for
 * a split deployment (web and API on different sites), which also needs CORS_ORIGINS.
 */
const cookieBase = () => ({ secure: env.isProd, sameSite: env.COOKIE_SAMESITE });

/** Not a secret: tells the web app a session may exist, so guests skip the refresh call. */
export const SESSION_HINT_COOKIE = 'pe_session';

export function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, { ...cookieBase(), httpOnly: true, path: '/api/v1/auth', expires });
  res.cookie(SESSION_HINT_COOKIE, '1', { ...cookieBase(), httpOnly: false, path: '/', expires });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { ...cookieBase(), httpOnly: true, path: '/api/v1/auth' });
  res.clearCookie(SESSION_HINT_COOKIE, { ...cookieBase(), path: '/' });
}
