import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const usersRepo = {
  findById: (id: number) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findByPhone: (phone: string) => prisma.user.findUnique({ where: { phone } }),
  findByGoogleId: (googleId: string) => prisma.user.findUnique({ where: { googleId } }),
  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
  update: (id: number, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),

  async stats(userId: number) {
    const [stamps, saved, visited] = await Promise.all([
      prisma.stamp.count({ where: { userId } }),
      prisma.userSavedPlace.count({ where: { userId } }),
      prisma.itineraryStop.findMany({
        where: { done: true, itineraryDay: { userId } },
        select: { placeId: true, name: true },
      }),
    ]);
    const visitedPlaces = new Set(visited.map((s) => s.placeId ?? s.name)).size;
    return { stamps, saved, visitedPlaces };
  },

  /** Passport: every stamp with its place, newest first, plus how many places can be stamped. */
  async stamps(userId: number) {
    const [rows, total, forts] = await Promise.all([
      prisma.stamp.findMany({
        where: { userId },
        orderBy: { collectedAt: 'desc' },
        select: { collectedAt: true, place: { select: { id: true, name: true, name_mr: true, category: true, kind: true, estYear: true } } },
      }),
      prisma.place.count({ where: { curated: true } }),
      prisma.stamp.count({ where: { userId, place: { category: 'Fort' } } }),
    ]);
    return { rows, total, forts };
  },

  // ── Avatar (stored re-encoded; served by random key) ─────────
  setAvatar: (userId: number, key: string, data: Buffer, avatarUrl: string) =>
    prisma.$transaction([
      prisma.avatar.deleteMany({ where: { userId } }),
      prisma.avatar.create({ data: { key, userId, data } }),
      prisma.user.update({ where: { id: userId }, data: { avatarUrl } }),
    ]),
  removeAvatar: (userId: number) =>
    prisma.$transaction([prisma.avatar.deleteMany({ where: { userId } }), prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } })]),
  avatarByKey: (key: string) => prisma.avatar.findUnique({ where: { key }, select: { data: true, mime: true } }),
};

export const refreshTokensRepo = {
  create: (data: { userId: number; tokenHash: string; expiresAt: Date }) => prisma.refreshToken.create({ data }),
  findByHash: (tokenHash: string) => prisma.refreshToken.findUnique({ where: { tokenHash } }),
  revoke: (id: string) => prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
  revokeAllForUser: (userId: number) =>
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
};
