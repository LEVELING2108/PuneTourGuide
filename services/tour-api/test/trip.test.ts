import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { isStale } from '../src/v1/itinerary/run.service';
import { api, auth, resetUsers, signUp } from './helpers';

const placeId = async (name: string) => (await prisma.place.findFirstOrThrow({ where: { name } })).id;

/** A user with Shaniwar Wada and Lal Mahal on Day 1. */
async function planned() {
  const u = await signUp();
  const days = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
  const [day1, day2] = days;
  const stops = [];
  for (const name of ['Shaniwar Wada', 'Lal Mahal']) {
    const res = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId(name), dayId: day1.id });
    stops.push(res.body.data.stop);
  }
  return { u, day1, day2, stops };
}

describe('trip mode (Start Day N)', () => {
  beforeAll(async () => {
    await seedCatalogue();
    await invalidateCache('tour:*');
  });
  beforeEach(resetUsers);

  it('needs a login and a day with places', async () => {
    expect((await api().get('/api/v1/itinerary/run')).status).toBe(401);
    const { u, day2 } = await planned();
    const res = await api().post(`/api/v1/itinerary/days/${day2.id}/start`).set(auth(u.token));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DAY_EMPTY');
  });

  it('starts a day once, survives a reload, and only one day runs at a time', async () => {
    const { u, day1, day2 } = await planned();
    expect((await api().get('/api/v1/itinerary/run').set(auth(u.token))).body.data).toBeNull();

    const first = await api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token));
    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({ dayId: day1.id, dayNumber: 1, endedAt: null, skipped: [], summary: null });
    // Starting again (second tap, second device) carries on with the same run
    const again = await api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token));
    expect(again.body.data.id).toBe(first.body.data.id);
    expect((await api().get('/api/v1/itinerary/run').set(auth(u.token))).body.data.id).toBe(first.body.data.id);

    // Two taps at the same moment still make one run
    const both = await Promise.all([1, 2].map(() => api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token))));
    expect(new Set(both.map((r) => r.body.data.id))).toEqual(new Set([first.body.data.id]));

    // Starting Day 2 ends Day 1
    await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId('Aga Khan Palace'), dayId: day2.id });
    const second = await api().post(`/api/v1/itinerary/days/${day2.id}/start`).set(auth(u.token));
    expect(second.body.data.dayNumber).toBe(2);
    const old = await prisma.dayRun.findUniqueOrThrow({ where: { id: first.body.data.id } });
    expect(old.endReason).toBe('replaced');
    expect(await prisma.dayRun.count({ where: { endedAt: null } })).toBe(1);
  });

  it('skips and un-skips stops, and never touches another user’s trip', async () => {
    const { u, day1, stops } = await planned();
    const run = (await api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token))).body.data;
    const skip = (skipped: boolean, token = u.token, stopId = stops[0].id) =>
      api().post(`/api/v1/itinerary/runs/${run.id}/skip`).set(auth(token)).send({ stopId, skipped });

    expect((await skip(true)).body.data.skipped).toEqual([stops[0].id]);
    expect((await skip(true)).body.data.skipped).toEqual([stops[0].id]); // repeating is harmless (offline queue)
    expect((await skip(false)).body.data.skipped).toEqual([]);

    const other = await signUp();
    expect((await skip(true, other.token)).status).toBe(404);
    expect((await api().post(`/api/v1/itinerary/runs/${run.id}/end`).set(auth(other.token))).status).toBe(404);
    expect((await skip(true, u.token, 999999)).status).toBe(404);
    expect((await api().post(`/api/v1/itinerary/runs/${run.id}/skip`).set(auth(u.token)).send({ stopId: 'x' })).status).toBe(400);
  });

  it('ends with a summary of what this trip did, and ending twice is harmless', async () => {
    const { u, day1, stops } = await planned();
    // Ticked before the trip started: not part of the trip
    await api().patch(`/api/v1/itinerary/stops/${stops[1].id}`).set(auth(u.token)).send({ done: true });
    await prisma.itineraryStop.update({ where: { id: stops[1].id }, data: { doneAt: new Date(Date.now() - 60_000) } });

    const run = (await api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token))).body.data;
    const tick = await api().patch(`/api/v1/itinerary/stops/${stops[0].id}`).set(auth(u.token)).send({ done: true });
    expect(tick.body.data.xpAwarded).toBeGreaterThan(0);

    const end = await api().post(`/api/v1/itinerary/runs/${run.id}/end`).set(auth(u.token)).send({ reason: 'complete' });
    expect(end.status).toBe(200);
    expect(end.body.data).toMatchObject({ endReason: 'complete', summary: { placesVisited: 1, xpEarned: tick.body.data.xpAwarded } });
    expect(end.body.data.endedAt).not.toBeNull();
    const twice = await api().post(`/api/v1/itinerary/runs/${run.id}/end`).set(auth(u.token)).send({ reason: 'user' });
    expect(twice.body.data).toEqual(end.body.data);
    expect((await api().get('/api/v1/itinerary/run').set(auth(u.token))).body.data).toBeNull();
    expect((await api().post(`/api/v1/itinerary/runs/${run.id}/skip`).set(auth(u.token)).send({ stopId: stops[0].id })).status).toBe(409);
  });

  it('un-ticking a stop clears when it was done, but keeps the XP it earned', async () => {
    const { u, stops } = await planned();
    await api().patch(`/api/v1/itinerary/stops/${stops[0].id}`).set(auth(u.token)).send({ done: true });
    const ticked = await prisma.itineraryStop.findUniqueOrThrow({ where: { id: stops[0].id } });
    expect(ticked.doneAt).not.toBeNull();
    expect(ticked.xpAwarded).toBeGreaterThan(0);
    await api().patch(`/api/v1/itinerary/stops/${stops[0].id}`).set(auth(u.token)).send({ done: false });
    const unticked = await prisma.itineraryStop.findUniqueOrThrow({ where: { id: stops[0].id } });
    expect(unticked.doneAt).toBeNull();
    expect(unticked.xpAwarded).toBe(ticked.xpAwarded);
  });

  it('a forgotten trip ends by itself and counts the km between places visited', async () => {
    const { u, day1, stops } = await planned();
    const run = (await api().post(`/api/v1/itinerary/days/${day1.id}/start`).set(auth(u.token))).body.data;
    for (const s of stops) await api().patch(`/api/v1/itinerary/stops/${s.id}`).set(auth(u.token)).send({ done: true });
    // Pretend it was started yesterday morning
    const yesterday = new Date(Date.now() - 26 * 3600_000);
    await prisma.dayRun.update({ where: { id: run.id }, data: { startedAt: yesterday } });
    await prisma.itineraryStop.updateMany({ where: { id: { in: stops.map((s) => s.id) } }, data: { doneAt: new Date(yesterday.getTime() + 3600_000) } });

    expect((await api().get('/api/v1/itinerary/run').set(auth(u.token))).body.data).toBeNull();
    const ended = await prisma.dayRun.findUniqueOrThrow({ where: { id: run.id } });
    expect(ended.endReason).toBe('auto');
    expect(ended.endedAt!.getTime() - yesterday.getTime()).toBe(14 * 3600_000); // closed when it went stale
    expect(ended.placesVisited).toBe(2);
    expect(ended.km).toBeGreaterThan(0); // Shaniwar Wada → Lal Mahal
    expect(ended.km).toBeLessThan(1);
  });

  it('treats the small hours as the same trip day', () => {
    const at = (iso: string) => new Date(iso);
    // 9 PM → 2 AM Pune: same trip day; 9 PM → 5 AM: the next one
    expect(isStale(at('2026-10-22T15:30:00Z'), at('2026-10-22T20:30:00Z'))).toBe(false);
    expect(isStale(at('2026-10-22T15:30:00Z'), at('2026-10-22T23:30:00Z'))).toBe(true);
    // Over 14 hours is always stale
    expect(isStale(at('2026-10-22T00:30:00Z'), at('2026-10-22T15:00:00Z'))).toBe(true);
  });
});
