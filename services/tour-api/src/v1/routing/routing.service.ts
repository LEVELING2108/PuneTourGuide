import { osrmRoute, osrmTable, type LatLng, type OsrmRoute, type OsrmStep, type Profile } from '../../clients/osrm';
import { AppError } from '../../lib/errors';
import { getCachedData, setCachedData } from '../../services/cacheService';

const DAY = 24 * 3600;
// ~11 m: close enough to share a cached route, far enough apart to stay correct.
const keyOf = (pts: LatLng[]) => pts.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join(';');

/** One upstream call per key per instance, however many users ask at once. */
const inflight = new Map<string, Promise<unknown>>();
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const haversineKm = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

/** Road-time estimate when the router is down: 1.3 x straight line at Pune city auto speed. */
const estimateSeconds = (a: LatLng, b: LatLng) => ((haversineKm(a, b) * 1.3) / 18) * 3600;

export function instruction(s: OsrmStep): string {
  const onto = s.name ? ` onto ${s.name}` : '';
  if (s.type === 'depart') return s.name ? `Head out on ${s.name}` : 'Head out';
  if (s.type === 'arrive') return 'You have arrived';
  if (s.type === 'roundabout' || s.type === 'rotary') return `Take the roundabout${onto}`;
  if (s.type === 'merge') return `Merge${onto}`;
  const m = s.modifier;
  if (!m || m === 'straight') return s.name ? `Continue on ${s.name}` : 'Continue straight';
  if (m === 'uturn') return 'Make a U-turn';
  const side = m.includes('left') ? 'left' : 'right';
  if (s.type === 'fork') return `Keep ${side}${onto}`;
  const verb = m.startsWith('slight') ? 'Bear' : m.startsWith('sharp') ? 'Turn sharp' : 'Turn';
  return `${verb} ${side}${onto}`;
}

export const routingService = {
  /** Directions through the points in order (cached 24 h per point list and mode). */
  async directions(pts: LatLng[], profile: Profile) {
    const key = `tour:dir:${profile}:${keyOf(pts)}`;
    let route = await getCachedData<OsrmRoute>(key);
    if (!route) {
      try {
        route = await once(key, () => osrmRoute(pts, profile));
      } catch {
        throw new AppError(503, 'ROUTING_UNAVAILABLE', 'Directions are unavailable right now. Try again in a minute.');
      }
      await setCachedData(key, route, DAY);
    }
    return {
      mode: profile === 'foot' ? 'walk' : 'auto',
      distanceM: Math.round(route.distanceM),
      durationS: Math.round(route.durationS),
      geometry: route.geometry,
      legs: route.legs.map((l) => ({ distanceM: Math.round(l.distanceM), durationS: Math.round(l.durationS) })),
      steps: route.steps.map((s) => ({ ...s, distanceM: Math.round(s.distanceM), durationS: Math.round(s.durationS), instruction: instruction(s) })),
    };
  },

  /**
   * Travel-time matrix in seconds for Optimise. Falls back to a straight-line estimate when
   * the router is unreachable, and says so (`estimated`), so planning still works.
   */
  async matrix(pts: LatLng[], profile: Profile = 'car'): Promise<{ seconds: number[][]; estimated: boolean }> {
    const key = `tour:table:${profile}:${keyOf(pts)}`;
    const cached = await getCachedData<number[][]>(key);
    if (cached) return { seconds: cached, estimated: false };
    try {
      const raw = await once(key, () => osrmTable(pts, profile));
      const seconds = raw.map((row, i) => row.map((v, j) => (v === null ? estimateSeconds(pts[i], pts[j]) : v)));
      await setCachedData(key, seconds, DAY);
      return { seconds, estimated: false };
    } catch {
      return { seconds: pts.map((a) => pts.map((b) => estimateSeconds(a, b))), estimated: true };
    }
  },
};
