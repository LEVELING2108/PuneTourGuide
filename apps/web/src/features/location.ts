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
