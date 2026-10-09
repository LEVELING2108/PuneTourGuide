import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { randomToken, sha256 } from '../../lib/crypto';
import { conflict, unauthorized } from '../../lib/errors';
import { signAccessToken } from '../../lib/tokens';
import { toUserDto, type UserDto } from '../users/users.dto';
import { refreshTokensRepo, usersRepo } from '../users/users.repository';
import type { LoginInput, RegisterInput } from './auth.schemas';

export const BCRYPT_COST = 12;

export type Session = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  refreshExpires: Date;
  isNewUser: boolean;
};

// Compared against when the email is unknown, so timing doesn't reveal which emails exist
const DUMMY_HASH = bcrypt.hashSync('pune-explorer-timing-guard', 4);

export const authService = {
  /** Access token (15 min) + rotating refresh token (stored hashed). */
  async issueSession(userId: number, isNewUser = false): Promise<Session> {
    const user = await usersRepo.findById(userId);
    if (!user) throw unauthorized();
    const refreshToken = randomToken(32);
    const refreshExpires = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await refreshTokensRepo.create({ userId, tokenHash: sha256(refreshToken), expiresAt: refreshExpires });
    return { user: toUserDto(user), accessToken: signAccessToken(userId), refreshToken, refreshExpires, isNewUser };
  },

  async register(input: RegisterInput): Promise<Session> {
    if (await usersRepo.findByEmail(input.email)) {
      throw conflict('EMAIL_TAKEN', 'An account with this email already exists. Try logging in.');
    }
    const user = await usersRepo.create({
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, BCRYPT_COST),
      interests: input.interests ?? [],
      theme: input.theme ?? 'classic',
      language: input.language ?? 'en',
    });
    return this.issueSession(user.id, true);
  },

  async login(input: LoginInput): Promise<Session> {
    const user = await usersRepo.findByEmail(input.email);
    const ok = await bcrypt.compare(input.password, user?.password ?? DUMMY_HASH);
    // Same error for unknown email and wrong password
    if (!user || !user.password || !ok) throw unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');
    return this.issueSession(user.id);
  },

  /** Rotate: revoke the presented token, issue a new pair. Reuse of a revoked token revokes everything. */
  async refresh(token: string | undefined): Promise<Session> {
    if (!token) throw unauthorized('REFRESH_MISSING', 'Session expired, please log in again');
    const row = await refreshTokensRepo.findByHash(sha256(token));
    if (!row) throw unauthorized('REFRESH_INVALID', 'Session expired, please log in again');
    if (row.revokedAt) {
      await refreshTokensRepo.revokeAllForUser(row.userId);
      throw unauthorized('REFRESH_REUSED', 'Session expired, please log in again');
    }
    if (row.expiresAt < new Date()) throw unauthorized('REFRESH_EXPIRED', 'Session expired, please log in again');
    await refreshTokensRepo.revoke(row.id);
    return this.issueSession(row.userId);
  },

  async logout(token: string | undefined) {
    if (!token) return;
    const row = await refreshTokensRepo.findByHash(sha256(token));
    if (row && !row.revokedAt) await refreshTokensRepo.revoke(row.id);
  },

  async revokeAll(userId: number) {
    await refreshTokensRepo.revokeAllForUser(userId);
  },
};
