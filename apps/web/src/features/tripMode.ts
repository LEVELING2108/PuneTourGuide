/**
 * Trip mode: "Start Day N" (TECH_DESIGN §9.14).
 *
 * The running day, a copy of its stops and a queue of ticks / skips / end live on this phone, so the
 * trip keeps working with no signal (forts, ghats): actions apply at once and are sent when the
 * phone is back online. The server stays the source of truth whenever it can be reached.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiError } from '../api/client';
import { itineraryApi, type DayRun, type PlanDay } from '../api/itinerary';
import { usersApi } from '../api/auth';
import { useAuthStore, useIsLoggedIn } from '../stores/auth';
import { stopTripShare } from './trip';
import { useLiveStore } from './live';

export type TripAction =
  | { kind: 'tick'; stopId: number; done: boolean }
  | { kind: 'skip'; runId: number; stopId: number; skipped: boolean }
  | { kind: 'end'; runId: number; reason: 'user' | 'complete' };

type TripState = {
  /** Whose trip this is (another account on this phone never sees it) */
  userId: number | null;
  run: DayRun | null;
  /** The running day's stops as last seen, for when there is no signal */
  day: PlanDay | null;
  queue: TripAction[];
  /** Stops we already asked "You've arrived?" about */
  asked: number[];
  /** Live share started by "Start Day" (ended with the day) */
  shareSession: string | null;
  /** The last ended trip, for the summary card */
  finished: DayRun | null;
  lastMoveAt: number | null;
  set: (patch: Partial<Omit<TripState, 'set'>>) => void;
};

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({ userId: null, run: null, day: null, queue: [], asked: [], shareSession: null, finished: null, lastMoveAt: null, set: (patch) => set(patch) }),
    { name: 'pe_trip', partialize: ({ set: _set, ...rest }) => rest }
  )
);

const applyTick = (day: PlanDay | null, stopId: number, done: boolean): PlanDay | null =>
  day && { ...day, stops: day.stops.map((s) => (s.id === stopId ? { ...s, done } : s)) };

const applySkip = (run: DayRun | null, stopId: number, skipped: boolean): DayRun | null =>
  run && { ...run, skipped: skipped ? [...new Set([...run.skipped, stopId])] : run.skipped.filter((id) => id !== stopId) };

/** Records an action on this phone at once; `flushTrip` sends it. */
export function queueTrip(a: TripAction) {
  const s = useTripStore.getState();
  // A newer tick / skip of the same stop replaces the older one still waiting
  const queue = s.queue.filter((q) => !(q.kind === a.kind && 'stopId' in q && 'stopId' in a && q.stopId === a.stopId));
  if (a.kind === 'tick') s.set({ queue: [...queue, a], day: applyTick(s.day, a.stopId, a.done) });
  else if (a.kind === 'skip') s.set({ queue: [...queue, a], run: applySkip(s.run, a.stopId, a.skipped) });
  else s.set({ queue: [...queue, a] });
}

const isOffline = (err: unknown) => err instanceof ApiError && err.isOffline;

type FlushResult = { xp: number; stamps: number; ended: DayRun | null };

let chain: Promise<unknown> = Promise.resolve();

/**
 * Sends waiting actions in order. Stops at the first network failure (tries again later); drops an
 * action the server refuses (e.g. the stop was deleted) so one bad item never blocks the rest.
 * Calls run one after another, and each call gets a pass that starts after it was made, so an
 * action queued while another send is under way is never left behind.
 */
export function flushTrip(): Promise<FlushResult> {
  const pass = chain.then(drain, drain);
  chain = pass;
  return pass;
}

async function drain(): Promise<FlushResult> {
  let xp = 0;
  let stamps = 0;
  let ended: DayRun | null = null;
  for (;;) {
    const a = useTripStore.getState().queue[0];
    if (!a) break;
    try {
      if (a.kind === 'tick') {
        const r = await itineraryApi.updateStop(a.stopId, { done: a.done });
        xp += r.xpAwarded;
        if (r.stampCollected) stamps += 1;
        const { user, setUser } = useAuthStore.getState();
        if (user && r.totalXp !== undefined) setUser({ ...user, xp: r.totalXp });
      } else if (a.kind === 'skip') {
        const run = await itineraryApi.skip(a.runId, a.stopId, a.skipped);
        const s = useTripStore.getState();
        if (s.run?.id === run.id) s.set({ run: { ...run, skipped: s.run.skipped } });
      } else {
        ended = await itineraryApi.endRun(a.runId, a.reason);
      }
    } catch (err) {
      if (isOffline(err)) break;
    }
    const s = useTripStore.getState();
    s.set({ queue: s.queue.filter((q) => q !== a) });
  }
  if (stamps) usersApi.me().then(useAuthStore.getState().setUser, () => undefined);
  return { xp, stamps, ended };
}

/** Ends the live share that "Start Day" turned on, if it is still the one running. */
async function endTripShare() {
  const { shareSession, set } = useTripStore.getState();
  if (shareSession && useLiveStore.getState().trip?.sessionId === shareSession) await stopTripShare();
  set({ shareSession: null });
}

/** Clears the running trip on this phone, keeping its summary to show. */
export async function closeTrip(ended: DayRun | null) {
  useTripStore.getState().set({ run: null, day: null, asked: [], finished: ended, lastMoveAt: null });
  await endTripShare();
}

/**
 * The running trip. Online, the server decides (it ends a forgotten trip by itself); offline, the
 * copy on this phone. Also keeps the copy of the day's stops fresh from the plan.
 */
export function useTripRun(plan: PlanDay[] | undefined) {
  const loggedIn = useIsLoggedIn();
  const local = useTripStore();
  const q = useQuery({
    queryKey: ['run'],
    queryFn: async () => {
      await flushTrip();
      return itineraryApi.run();
    },
    enabled: loggedIn,
    staleTime: 30_000,
    retry: (n, err) => !isOffline(err) && n < 1,
  });

  useEffect(() => {
    if (!q.isSuccess) return;
    const s = useTripStore.getState();
    if (s.queue.length) return; // our own changes are still on their way
    if (q.data) {
      if (s.run?.id !== q.data.id) s.set({ asked: [], lastMoveAt: Date.now() });
      s.set({ run: q.data });
    } else if (s.run) {
      // Ended elsewhere (another device, or automatically after the day was over)
      void closeTrip(null);
    }
  }, [q.isSuccess, q.data]);

  const day = plan?.find((d) => d.id === local.run?.dayId) ?? null;
  useEffect(() => {
    // The plan is the truth; queued ticks still waiting are laid on top
    if (!day) return;
    const s = useTripStore.getState();
    let fresh: PlanDay | null = day;
    for (const a of s.queue) if (a.kind === 'tick') fresh = applyTick(fresh, a.stopId, a.done);
    s.set({ day: fresh });
  }, [day]);

  return { run: local.run, day: local.day, queued: local.queue.length, loading: q.isLoading && !local.run };
}

/**
 * Mounted once at the root. Sends waiting actions whenever the phone comes back online (and every
 * half minute meanwhile), and forgets the trip on sign-out or when another account signs in.
 */
export function useTripSync() {
  const qc = useQueryClient();
  const loggedIn = useIsLoggedIn();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    const s = useTripStore.getState();
    if (userId != null && s.userId !== userId) {
      if (s.userId != null) resetTrip();
      useTripStore.getState().set({ userId });
    }
  }, [userId]);

  // A real sign-out (signed in → signed out), not a phone that started without signal
  useEffect(
    () =>
      useAuthStore.subscribe((now, before) => {
        if (before.user && !now.user) resetTrip();
      }),
    []
  );

  useEffect(() => {
    if (!loggedIn) return;
    const go = () => {
      if (!useTripStore.getState().queue.length) return;
      void flushTrip().then((r) => {
        if (r.ended) void closeTrip(r.ended);
        void qc.invalidateQueries({ queryKey: ['itinerary'] });
        void qc.invalidateQueries({ queryKey: ['run'] });
      });
    };
    go();
    window.addEventListener('online', go);
    const id = window.setInterval(go, 30_000);
    return () => {
      window.removeEventListener('online', go);
      window.clearInterval(id);
    };
  }, [loggedIn, qc]);
}

/** Start (or carry on with) a day. Needs a connection: it creates the trip on the server. */
export function useStartDay() {
  const qc = useQueryClient();
  return useCallback(
    async (day: PlanDay) => {
      const s = useTripStore.getState();
      const run = await itineraryApi.startDay(day.id);
      if (s.run && s.run.id !== run.id) await endTripShare(); // the old day's share ends with it
      if (s.run?.id !== run.id) s.set({ asked: [], lastMoveAt: Date.now(), finished: null });
      s.set({ run, day });
      qc.setQueryData(['run'], run);
      return run;
    },
    [qc]
  );
}

export { trackLink } from './phoneSms';

export type VisitResult = { synced: boolean; xp: number; stamp: boolean };

/** Visit / skip / end, each recorded on the phone first and sent when possible. */
export function useTripActions() {
  const qc = useQueryClient();
  const refresh = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['itinerary'] });
    void qc.invalidateQueries({ queryKey: ['stamps'] });
  }, [qc]);

  const visit = useCallback(
    async (stopId: number, done = true): Promise<VisitResult> => {
      queueTrip({ kind: 'tick', stopId, done });
      const r = await flushTrip();
      const synced = !useTripStore.getState().queue.some((a) => a.kind === 'tick' && a.stopId === stopId);
      if (synced) refresh();
      return { synced, xp: r.xp, stamp: r.stamps > 0 };
    },
    [refresh]
  );

  const skip = useCallback(async (stopId: number, skipped = true) => {
    const run = useTripStore.getState().run;
    if (!run) return { synced: false };
    queueTrip({ kind: 'skip', runId: run.id, stopId, skipped });
    await flushTrip();
    return { synced: !useTripStore.getState().queue.some((a) => a.kind === 'skip' && a.stopId === stopId) };
  }, []);

  /** Ends the day. Offline, the summary is worked out on the phone and the end is sent later. */
  const end = useCallback(
    async (reason: 'user' | 'complete'): Promise<DayRun | null> => {
      const { run, day } = useTripStore.getState();
      if (!run) return null;
      queueTrip({ kind: 'end', runId: run.id, reason });
      const r = await flushTrip();
      let ended = r.ended;
      if (!ended) {
        const done = day?.stops.filter((s) => s.done) ?? [];
        const now = new Date();
        ended = {
          ...run,
          endedAt: now.toISOString(),
          endReason: reason,
          summary: {
            placesVisited: done.length,
            xpEarned: 0,
            km: 0,
            minutes: Math.max(0, Math.round((now.getTime() - new Date(run.startedAt).getTime()) / 60_000)),
          },
        };
      }
      await closeTrip(ended);
      qc.setQueryData(['run'], null);
      refresh();
      return ended;
    },
    [qc, refresh]
  );

  return { visit, skip, end };
}

/** Forget the trip on this phone (sign-out, or another account). */
export const resetTrip = () =>
  useTripStore.getState().set({ userId: null, run: null, day: null, queue: [], asked: [], shareSession: null, finished: null, lastMoveAt: null });
