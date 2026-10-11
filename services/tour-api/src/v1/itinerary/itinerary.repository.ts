import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const placeSelect = {
  id: true,
  name: true,
  name_mr: true,
  category: true,
  kind: true,
  area: true,
  latitude: true,
  longitude: true,
  weakSignal: true,
  xp: true,
  visitMinutes: true,
  nearestHospitalName: true,
  nearestHospitalKm: true,
} satisfies Prisma.PlaceSelect;

export const dayInclude = {
  stops: { orderBy: [{ order: 'asc' }, { id: 'asc' }], include: { place: { select: placeSelect } } },
} satisfies Prisma.ItineraryDayInclude;

export type DayWithStops = Prisma.ItineraryDayGetPayload<{ include: typeof dayInclude }>;
export type StopWithPlace = DayWithStops['stops'][number];

export const itineraryRepo = {
  days: (userId: number) =>
    prisma.itineraryDay.findMany({ where: { userId }, include: dayInclude, orderBy: [{ day: 'asc' }, { id: 'asc' }] }),

  day: (userId: number, dayId: number) => prisma.itineraryDay.findFirst({ where: { id: dayId, userId }, include: dayInclude }),

  createDay: (data: { userId: number; day: number; label: string; date: Date }) =>
    prisma.itineraryDay.create({ data, include: dayInclude }),

  setDayDate: (id: number, date: Date, label: string) => prisma.itineraryDay.update({ where: { id }, data: { date, label } }),

  stop: (userId: number, stopId: number) =>
    prisma.itineraryStop.findFirst({ where: { id: stopId, itineraryDay: { userId } }, include: { place: { select: placeSelect }, itineraryDay: true } }),

  place: (placeId: number) => prisma.place.findUnique({ where: { id: placeId } }),

  createStop: (data: Prisma.ItineraryStopUncheckedCreateInput) => prisma.itineraryStop.create({ data }),

  updateStop: (id: number, data: Prisma.ItineraryStopUpdateInput) => prisma.itineraryStop.update({ where: { id }, data }),

  deleteStop: (id: number) => prisma.itineraryStop.delete({ where: { id } }),

  route: (routeId: number) =>
    prisma.route.findUnique({ where: { id: routeId }, include: { stops: { orderBy: { order: 'asc' }, include: { place: true } } } }),

  routes: () =>
    prisma.route.findMany({
      orderBy: { sort: 'asc' },
      include: { stops: { orderBy: { order: 'asc' }, include: { place: { select: { id: true, name: true, name_mr: true, nearestHospitalKm: true, weakSignal: true } } } } },
    }),

  /**
   * Tick / untick a stop. Ticking awards the place's XP once and collects a stamp
   * (unique per user + place, so re-ticking never double-awards).
   */
  async setDone(userId: number, stopId: number, done: boolean, placeId: number | null, xp: number) {
    return prisma.$transaction(async (tx) => {
      await tx.itineraryStop.update({ where: { id: stopId }, data: { done } });
      let stampCollected = false;
      let xpAwarded = 0;
      if (done && placeId) {
        const { count } = await tx.stamp.createMany({ data: [{ userId, placeId }], skipDuplicates: true });
        if (count === 1) {
          await tx.user.update({ where: { id: userId }, data: { xp: { increment: xp } } });
          stampCollected = true;
          xpAwarded = xp;
        }
      }
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } });
      return { stampCollected, xpAwarded, totalXp: user.xp };
    });
  },

  reorder: (stops: { id: number; order: number; time?: string }[]) =>
    prisma.$transaction(stops.map((s) => prisma.itineraryStop.update({ where: { id: s.id }, data: { order: s.order, ...(s.time ? { time: s.time } : {}) } }))),
};
