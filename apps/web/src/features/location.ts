import { useEffect, useState } from 'react';
import { usePermissionStore } from '../stores/permissions';
import { getPosition, lastPosition, rememberPosition } from './permissions';

export type Position = { lat: number; lng: number; known: boolean };

/**
 * Where the user is: last known fix immediately, refreshed once (low accuracy) when location is allowed.
 * Falls back to Pune centre with known=false.
 */
export function useCurrentPosition(): Position {
  const allowed = usePermissionStore((s) => s.location);
  const [pos, setPos] = useState<Position>(() => lastPosition());

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    getPosition({ enableHighAccuracy: false, maximumAge: 5 * 60_000 })
      .then((p) => {
        if (cancelled) return;
        rememberPosition(p.coords.latitude, p.coords.longitude);
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, known: true });
      })
      .catch(() => {
        /* keep last known */
      });
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  return pos;
}

/** "18.520,73.857" rounded to ~100 m so query keys stay stable. */
export const nearParam = (p: Position) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;

/**
 * Live position for Directions: high accuracy only while the screen is open (TECH_DESIGN §3),
 * stopped on unmount so the GPS does not drain the battery.
 */
export function useWatchPosition(): { pos: Position | null; denied: boolean } {
  const [pos, setPos] = useState<Position | null>(null);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setDenied(true);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setDenied(false);
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, known: true });
        rememberPosition(p.coords.latitude, p.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setDenied(true);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return { pos, denied };
}
