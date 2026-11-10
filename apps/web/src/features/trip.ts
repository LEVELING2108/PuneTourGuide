import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { trackingApi } from '../api/safety';
import { sosApi } from '../api/sos';
import { useIsLoggedIn } from '../stores/auth';
import { getTripPublisher, LivePublisher, setTripPublisher, useLiveStore } from './live';
import { lastPosition } from './permissions';
import { autoDownloadPacks } from './offline';
import { serverSms, shareTrackLink } from './phoneSms';
import { useSettingsStore } from '../stores/settings';

/** Stop the live share (toggle off, sign-out, or the page closing). */
export async function stopTripShare() {
  const p = getTripPublisher();
  const trip = useLiveStore.getState().trip;
  setTripPublisher(null);
  useLiveStore.getState().set({ trip: null, status: null });
  p?.stop(true);
  if (trip) await sosApi.stopTrip(trip.sessionId).catch(() => undefined);
}

/**
 * Plan → Share live trip (TECH_DESIGN §9.6): new tracking session → the link goes out (the phone's
 * share menu, or server texts to the contacts when server SMS is on) → this phone publishes its
 * location while the toggle is on and the app is open.
 */
export function useTripShare() {
  const trip = useLiveStore((s) => s.trip);
  const status = useLiveStore((s) => s.status);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    const session = await trackingApi.create();
    const texted = serverSms();
    try {
      const r = await sosApi.startTrip(session.session_id, texted);
      const pub = new LivePublisher(session, (s) => useLiveStore.getState().set({ status: s }));
      setTripPublisher(pub);
      useLiveStore.getState().set({ trip: { sessionId: session.session_id, sharedWith: r.sharedWith, texted } });
      const last = lastPosition();
      pub.start(last.known ? last : undefined);
      return { ...r, texted };
    } catch (err) {
      void trackingApi.close(session);
      throw err;
    }
  };

  /** handed: what happened to the phone's share menu when the phone hands the link over. */
  const toggle = async (): Promise<{ on: boolean; sharedWith?: string[]; texted?: boolean; handed?: 'shared' | 'copied' | 'cancelled' }> => {
    if (busy) return { on: !!trip };
    setBusy(true);
    try {
      if (trip) {
        await stopTripShare();
        return { on: false };
      }
      const r = await start();
      const handed = r.texted ? undefined : await shareTrackLink(r.sessionId);
      return { on: true, sharedWith: r.sharedWith, texted: r.texted, handed };
    } finally {
      setBusy(false);
    }
  };

  return { on: !!trip, sharedWith: trip?.sharedWith ?? [], texted: trip?.texted ?? false, status, busy, toggle };
}

export const isNoContacts = (err: unknown) => err instanceof ApiError && err.code === 'NO_CONTACTS';

/**
 * Mounted once at the root. A share that outlived its page (reload, closed tab) cannot publish
 * any more, so it is ended on the server; and closing the page ends the current one.
 */
export function useTripGuard() {
  const loggedIn = useIsLoggedIn();
  useEffect(() => {
    if (!loggedIn) {
      if (useLiveStore.getState().trip) void stopTripShare();
      return;
    }
    sosApi
      .activeTrip()
      .then((active) => {
        if (active && useLiveStore.getState().trip?.sessionId !== active.sessionId) void sosApi.stopTrip(active.sessionId);
      })
      .catch(() => undefined);
  }, [loggedIn]);

  const autoPacks = useSettingsStore((s) => s.autoDownloadPacks);
  useEffect(() => {
    void autoDownloadPacks(autoPacks, loggedIn);
  }, [autoPacks, loggedIn]);

  useEffect(() => {
    const onHide = (e: PageTransitionEvent) => {
      if (!e.persisted && useLiveStore.getState().trip) void stopTripShare();
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);
}
