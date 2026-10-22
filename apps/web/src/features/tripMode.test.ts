import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { itineraryApi, type DayRun, type PlanDay } from '../api/itinerary';
import { flushTrip, queueTrip, resetTrip, trackLink, useTripStore } from './tripMode';

vi.mock('../api/itinerary', async (orig) => ({
  ...(await orig<typeof import('../api/itinerary')>()),
  itineraryApi: { updateStop: vi.fn(), skip: vi.fn(), endRun: vi.fn() },
}));
vi.mock('../api/auth', () => ({ usersApi: { me: vi.fn(() => new Promise(() => undefined)) } }));

const api = vi.mocked(itineraryApi);
const offline = () => new ApiError(0, 'OFFLINE', 'You seem to be offline');

const run: DayRun = { id: 7, dayId: 1, dayNumber: 1, startedAt: new Date().toISOString(), endedAt: null, endReason: null, skipped: [], summary: null };
const day = {
  id: 1,
  day: 1,
  label: 'Day 1 · Thu',
  date: '2026-10-22',
  weekday: 'Thursday',
  stops: [10, 11].map((id) => ({ id, time: '9:00 AM', order: id, done: false, place: { id, name: `P${id}`, xp: 40 } })),
} as unknown as PlanDay;

describe('trip offline queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTrip();
    useTripStore.getState().set({ run, day });
  });

  it('applies a visit at once and keeps it while there is no signal', async () => {
    api.updateStop.mockRejectedValue(offline());
    queueTrip({ kind: 'tick', stopId: 10, done: true });
    expect(useTripStore.getState().day!.stops[0].done).toBe(true);
    await flushTrip();
    expect(useTripStore.getState().queue).toHaveLength(1);

    // Back online: sent once, and gone from the queue
    api.updateStop.mockResolvedValue({ stop: day.stops[0], stampCollected: true, xpAwarded: 40 });
    const r = await flushTrip();
    expect(r).toMatchObject({ xp: 40, stamps: 1 });
    expect(useTripStore.getState().queue).toHaveLength(0);
  });

  it('keeps only the latest change to the same stop, in order', async () => {
    api.updateStop.mockRejectedValue(offline());
    api.skip.mockRejectedValue(offline());
    queueTrip({ kind: 'skip', runId: 7, stopId: 11, skipped: true });
    queueTrip({ kind: 'skip', runId: 7, stopId: 11, skipped: false });
    queueTrip({ kind: 'tick', stopId: 10, done: true });
    expect(useTripStore.getState().queue).toEqual([
      { kind: 'skip', runId: 7, stopId: 11, skipped: false },
      { kind: 'tick', stopId: 10, done: true },
    ]);
    expect(useTripStore.getState().run!.skipped).toEqual([]);
  });

  it('drops an action the server refuses, so it never blocks the rest', async () => {
    api.updateStop.mockRejectedValueOnce(new ApiError(404, 'STOP_NOT_FOUND', 'Stop not found'));
    api.endRun.mockResolvedValue({ ...run, endedAt: new Date().toISOString(), endReason: 'user' });
    queueTrip({ kind: 'tick', stopId: 99, done: true });
    queueTrip({ kind: 'end', runId: 7, reason: 'user' });
    const r = await flushTrip();
    expect(r.ended?.endReason).toBe('user');
    expect(useTripStore.getState().queue).toHaveLength(0);
  });

  it('still sends after a check that found nothing to send (regression)', async () => {
    await flushTrip(); // nothing waiting
    api.updateStop.mockResolvedValue({ stop: day.stops[0], stampCollected: false, xpAwarded: 0 });
    queueTrip({ kind: 'tick', stopId: 10, done: true });
    await flushTrip();
    expect(api.updateStop).toHaveBeenCalledWith(10, { done: true });
    expect(useTripStore.getState().queue).toHaveLength(0);
  });

  it('an action queued during a send goes out with the next pass', async () => {
    let release!: () => void;
    api.updateStop.mockImplementationOnce(() => new Promise((r) => (release = () => r({ stop: day.stops[0], stampCollected: false, xpAwarded: 0 }))));
    api.updateStop.mockResolvedValue({ stop: day.stops[1], stampCollected: false, xpAwarded: 0 });
    queueTrip({ kind: 'tick', stopId: 10, done: true });
    const first = flushTrip();
    await Promise.resolve();
    queueTrip({ kind: 'tick', stopId: 11, done: true });
    const second = flushTrip();
    release();
    await Promise.all([first, second]);
    expect(api.updateStop).toHaveBeenCalledTimes(2);
    expect(useTripStore.getState().queue).toHaveLength(0);
  });

  it('builds the public follow link', () => {
    expect(trackLink('abc')).toBe(`${window.location.origin}/track/abc`);
  });
});
