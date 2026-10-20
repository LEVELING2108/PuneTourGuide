import { prisma } from '../../lib/prisma';

export const googleRepo = {
  place: (id: number) =>
    prisma.place.findUnique({ where: { id }, select: { id: true, name: true, area: true, latitude: true, longitude: true, googlePlaceId: true } }),

  /** Places with coordinates that aren't linked to Google yet (the link script fills them). */
  unlinked: () =>
    prisma.place.findMany({
      where: { googlePlaceId: null, latitude: { not: null }, longitude: { not: null } },
      select: { id: true, name: true, area: true, latitude: true, longitude: true },
      orderBy: { id: 'asc' },
    }),

  setGooglePlaceId: (id: number, googlePlaceId: string) => prisma.place.update({ where: { id }, data: { googlePlaceId } }),

  /** Google ids of our own catalogue, so side quests never repeat a place we already list. */
  async catalogueGoogleIds(): Promise<Set<string>> {
    const rows = await prisma.place.findMany({ where: { googlePlaceId: { not: null } }, select: { googlePlaceId: true } });
    return new Set(rows.map((r) => r.googlePlaceId!));
  },

  async visitedSpots(userId: number, googleIds: string[]): Promise<Map<string, Date>> {
    if (!googleIds.length) return new Map();
    const rows = await prisma.spotVisit.findMany({ where: { userId, googlePlaceId: { in: googleIds } }, select: { googlePlaceId: true, visitedAt: true } });
    return new Map(rows.map((r) => [r.googlePlaceId, r.visitedAt]));
  },

  /** A side quest done: XP once per spot (unique per user + Google place id). */
  visitSpot: (userId: number, googlePlaceId: string, xp: number) =>
    prisma.$transaction(async (tx) => {
      const { count } = await tx.spotVisit.createMany({ data: [{ userId, googlePlaceId }], skipDuplicates: true });
      if (count === 1) await tx.user.update({ where: { id: userId }, data: { xp: { increment: xp } } });
      const [visit, user] = await Promise.all([
        tx.spotVisit.findUniqueOrThrow({ where: { userId_googlePlaceId: { userId, googlePlaceId } }, select: { visitedAt: true } }),
        tx.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
      ]);
      return { firstVisit: count === 1, xpAwarded: count === 1 ? xp : 0, totalXp: user.xp, visitedAt: visit.visitedAt };
    }),
};
