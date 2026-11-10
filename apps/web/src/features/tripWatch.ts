import { useEffect, useRef, useState } from 'react';
import type { Stop } from '../api/itinerary';
import { ArrivalWatch, metres, type Fix, type LatLng } from './tripLogic';
import { useTripStore } from './tripMode';
import { rememberPosition } from './permissions';

const MOVED_M = 150; // further than this from the last spot counts as "on the move"

/**
 * Watches the phone's location while trip mode or directions is on screen (paused when the app is
 * in the background, to save battery) and says when to ask "You've arrived?" for `stop`.
 */
export function useTripWatch(stop: Stop | null) {
  const [here, setHere] = useState<Fix | null>(null);
  const [arrived, setArrived] = useState<Stop | null>(null);
  const watch = useRef(new ArrivalWatch());
  const anchor = useRef<LatLng | null>(null);
  const target = useRef(stop);
  target.current = stop;

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let id: number | null = null;
    const startWatch = () => {
      if (id != null || document.visibilityState !== 'visible') return;
      id = navigator.geolocation.watchPosition(
        (p) => {
          const fix: Fix = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, speed: p.coords.speed, at: p.timestamp || Date.now() };
          setHere(fix);
          rememberPosition(fix.lat, fix.lng);
          const s = useTripStore.getState();
          if (fix.accuracy <= 100 && (!anchor.current || metres(anchor.current, fix) > MOVED_M)) {
            anchor.current = { lat: fix.lat, lng: fix.lng };
            s.set({ lastMoveAt: Date.now() });
          }
          const t = target.current;
          if (watch.current.feed(fix, t, new Set(s.asked)) && t) {
            s.set({ asked: [...s.asked, t.id] });
            setArrived(t);
          }
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
      );
    };
    const stopWatch = () => {
      if (id != null) navigator.geolocation.clearWatch(id);
      id = null;
      watch.current.reset();
    };
    const onVis = () => (document.visibilityState === 'visible' ? startWatch() : stopWatch());
    startWatch();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stopWatch();
    };
  }, []);

  return { here, arrived, dismiss: () => setArrived(null) };
}
