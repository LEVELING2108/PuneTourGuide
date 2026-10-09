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

/** Refresh token cookie (web). Cross-site in production (Vercel → API host), so SameSite=None there. */
export function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/api/v1/auth',
    expires,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth', httpOnly: true, secure: env.isProd, sameSite: env.isProd ? 'none' : 'lax' });
}
