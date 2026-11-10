import type { DayRun } from '@prisma/client';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { haversineKm } from '../../lib/geo';
import { itineraryRepo } from './itinerary.repository';
import { itineraryService } from './itinerary.service';
import { puneToday } from './time';

/**
 * Trip mode: "Start Day N" (TECH_DESIGN §9.14). A DayRun records when a day was started and
 * finished and which stops were skipped; visiting reuses the normal tick (XP, stamps). The next
 * stop is always worked out from the current plan, so editing the plan mid-trip is safe.
 */

const MAX_RUN_MS = 14 * 3600_000;
const DAY_ROLLS_AT_H = 4; // a trip day runs until 4 AM Pune time

/** Pune calendar day a moment belongs to, counting the small hours as the evening before. */
const tripDay = (t: Date) => puneToday(new Date(t.getTime() - DAY_ROLLS_AT_H * 3600_000)).getTime();

/** A forgotten run ends itself: after 14 hours, or once the trip day has rolled over. */
export const isStale = (startedAt: Date, now = new Date()) =>
  now.getTime() - startedAt.getTime() > MAX_RUN_MS || tripDay(now) !== tripDay(startedAt);

export type EndReason = 'user' | 'complete' | 'replaced' | 'auto';

export function toRunDto(r: DayRun) {
  return {
    id: r.id,
    dayId: r.dayId,
    dayNumber: r.dayNumber,
    startedAt: r.startedAt.toISOString(),
    endedAt: r.endedAt?.toISOString() ?? null,
    endReason: r.endReason,
    skipped: r.skipped,
    summary: r.endedAt
      ? {
          placesVisited: r.placesVisited ?? 0,
          xpEarned: r.xpEarned ?? 0,
          km: r.km ?? 0,
          minutes: Math.max(0, Math.round((r.endedAt.getTime() - r.startedAt.getTime()) / 60_000)),
        }
      : null,
  };
}

async function finish(userId: number, run: DayRun, reason: EndReason, now = new Date()): Promise<DayRun> {
  // An auto-ended run closes when it went stale, not when someone next opened the app
  const endedAt = reason === 'auto' ? new Date(Math.min(now.getTime(), run.startedAt.getTime() + MAX_RUN_MS)) : now;
  const done = await itineraryRepo.doneDuring(userId, run.startedAt, endedAt);
  const pts = done.flatMap((s) => (s.place?.latitude != null && s.place.longitude != null ? [{ lat: s.place.latitude, lng: s.place.longitude }] : []));
  let km = 0;
  for (let i = 1; i < pts.length; i++) km += haversineKm(pts[i - 1], pts[i]);
  await itineraryRepo.endRun(run.id, {
    endedAt,
    endReason: reason,
    placesVisited: done.length,
    xpEarned: done.reduce((n, s) => n + s.xpAwarded, 0),
    km: Math.round(km * 10) / 10,
  });
  return itineraryRepo.runById(run.id);
}

/** The running run, after ending it if it went stale. */
async function running(userId: number) {
  const run = await itineraryRepo.running(userId);
  if (run && isStale(run.startedAt)) {
    await finish(userId, run, 'auto');
    return null;
  }
  return run;
}

async function owned(userId: number, runId: number) {
  const run = await itineraryRepo.run(userId, runId);
  if (!run) throw notFound('RUN_NOT_FOUND', 'That trip was not found');
  return run;
}

export const runService = {
  async current(userId: number) {
    const run = await running(userId);
    return run ? toRunDto(run) : null;
  },

  /** Start a day, or carry on with it if it is already running. Starting another day ends the old one. */
  async start(userId: number, dayId: number) {
    const day = await itineraryService.targetDay(userId, dayId);
    if (!day.stops.length) throw badRequest('DAY_EMPTY', `Add places to Day ${day.day} before starting it`);
    const now = await running(userId);
    if (now?.dayId === day.id) return toRunDto(now);
    if (now) await finish(userId, now, 'replaced');
    // Another device may have started one at the same moment: carry on with that one
    const run = (await itineraryRepo.createRun(userId, day.id, day.day)) ?? (await itineraryRepo.running(userId));
    if (!run) throw conflict('RUN_BUSY', 'Could not start the day. Try again.');
    return toRunDto(run);
  },

  /** Skip a stop for this trip, or bring it back. Safe to repeat (the app queues it when offline). */
  async skip(userId: number, runId: number, stopId: number, skipped: boolean) {
    const run = await owned(userId, runId);
    if (run.endedAt) throw conflict('RUN_ENDED', 'This trip has already ended');
    if (!(await itineraryRepo.stop(userId, stopId))) throw notFound('STOP_NOT_FOUND', 'Stop not found');
    const set = new Set(run.skipped);
    if (skipped) set.add(stopId);
    else set.delete(stopId);
    return toRunDto(await itineraryRepo.setSkipped(run.id, [...set]));
  },

  /** End the trip and return its summary. Ending an ended trip returns the same summary. */
  async end(userId: number, runId: number, reason: 'user' | 'complete') {
    const run = await owned(userId, runId);
    return toRunDto(run.endedAt ? run : await finish(userId, run, reason));
  },
};
