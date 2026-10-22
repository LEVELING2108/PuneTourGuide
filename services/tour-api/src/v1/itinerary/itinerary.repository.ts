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
  hours: true,
  opensAt: true,
  closesAt: true,
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
      // doneAt / xpAwarded let trip mode count what a run achieved. XP is never taken back on
      // un-tick, so the stop keeps what it once earned.
      await tx.itineraryStop.update({
        where: { id: stopId },
        data: { done, doneAt: done ? new Date() : null, ...(xpAwarded ? { xpAwarded } : {}) },
      });
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } });
      return { stampCollected, xpAwarded, totalXp: user.xp };
    });
  },

  // ── Trip mode (DayRun) ────────────────────────────────────────────
  running: (userId: number) => prisma.dayRun.findFirst({ where: { userId, endedAt: null } }),

  run: (userId: number, runId: number) => prisma.dayRun.findFirst({ where: { id: runId, userId } }),

  /** Null when another device started a run at the same moment (one running run per user). */
  async createRun(userId: number, dayId: number, dayNumber: number) {
    try {
      return await prisma.dayRun.create({ data: { userId, dayId, dayNumber } });
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') return null;
      throw err;
    }
  },

  setSkipped: (runId: number, skipped: number[]) => prisma.dayRun.update({ where: { id: runId }, data: { skipped } }),

  /** Ends the run only if it is still running (so two ends never overwrite each other's summary). */
  endRun: (runId: number, data: { endedAt: Date; endReason: string; placesVisited: number; xpEarned: number; km: number }) =>
    prisma.dayRun.updateMany({ where: { id: runId, endedAt: null }, data }),

  runById: (runId: number) => prisma.dayRun.findUniqueOrThrow({ where: { id: runId } }),

  /** Stops the user ticked during a run (any day, in case one was moved), in the order they were done. */
  doneDuring: (userId: number, from: Date, to: Date) =>
    prisma.itineraryStop.findMany({
      where: { itineraryDay: { userId }, done: true, doneAt: { gte: from, lte: to } },
      orderBy: { doneAt: 'asc' },
      select: { id: true, xpAwarded: true, place: { select: { latitude: true, longitude: true } } },
    }),

  reorder: (stops: { id: number; order: number; time?: string }[]) =>
    prisma.$transaction(stops.map((s) => prisma.itineraryStop.update({ where: { id: s.id }, data: { order: s.order, ...(s.time ? { time: s.time } : {}) } }))),
};
