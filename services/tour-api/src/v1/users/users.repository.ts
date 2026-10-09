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
};

export const refreshTokensRepo = {
  create: (data: { userId: number; tokenHash: string; expiresAt: Date }) => prisma.refreshToken.create({ data }),
  findByHash: (tokenHash: string) => prisma.refreshToken.findUnique({ where: { tokenHash } }),
  revoke: (id: string) => prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
  revokeAllForUser: (userId: number) =>
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
};
