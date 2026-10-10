import { prisma } from '../../lib/prisma';

export type BBox = { south: number; west: number; north: number; east: number };

const inBox = (b: BBox) => ({ latitude: { gte: b.south, lte: b.north }, longitude: { gte: b.west, lte: b.east } });

export const offlineRepo = {
  places: (b: BBox) =>
    prisma.place.findMany({
      where: { curated: true, ...inBox(b) },
      orderBy: { popularity: 'desc' },
      select: {
        id: true,
        name: true,
        name_mr: true,
        category: true,
        area: true,
        latitude: true,
        longitude: true,
        hours: true,
        entryFee: true,
        weakSignal: true,
        nearestHospitalName: true,
        nearestHospitalKm: true,
      },
    }),

  help: (b: BBox) =>
    prisma.helpPlace.findMany({
      where: { category: { in: ['hospital', 'police', 'fire_station'] }, ...inBox(b) },
      orderBy: [{ emergency: 'desc' }, { name: 'asc' }],
      select: { name: true, category: true, emergency: true, phone: true, address: true, latitude: true, longitude: true },
    }),

  /** Places from the user's plan that fall inside the pack (for "suggested for your trips"). */
  planPlaces: (userId: number, b: BBox) =>
    prisma.itineraryStop.findMany({
      where: { itineraryDay: { userId }, place: inBox(b) },
      select: { place: { select: { name: true } }, itineraryDay: { select: { day: true } } },
    }),
};
