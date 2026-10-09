import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { safetyApi } from '../api/safety';
import { metres, type LatLng } from '../lib/geo';

export type HelpCategory = 'hospital' | 'clinic' | 'police' | 'fire_station';

/** One help point, whichever source it came from. */
export type Help = {
  key: string;
  name: string;
  category: HelpCategory;
  emergency: boolean;
  phone: string | null;
  address: string | null;
  lat: number;
  lng: number;
  km: number;
};

type ApiHelp = Omit<Help, 'key'> & { id: number };

const CATS: HelpCategory[] = ['hospital', 'clinic', 'police', 'fire_station'];
const rank = (h: Help) => (h.category === 'hospital' ? (h.emergency ? 0 : 1) : h.category === 'clinic' ? 3 : 2);

/**
 * Help near a point. The Tour API serves imported OSM data (fast, works when Overpass is down);
 * outside its area, or before the first import, the live safety service answers instead.
 */
async function fetchHelp(at: LatLng, signal?: AbortSignal): Promise<Help[]> {
  const near = `${at.lat.toFixed(3)},${at.lng.toFixed(3)}`;
  const r = await api<{ covered: boolean; items: ApiHelp[] }>('/help', { query: { near, limit: 30 }, signal });
  if (r.covered) return r.items.map((h) => ({ ...h, key: `h${h.id}` }));

  const live = await safetyApi.emergencyServices(at.lat, at.lng, signal);
  return live
    .filter((s) => CATS.includes(s.category as HelpCategory) && s.lat != null && s.lon != null && !/^Nearby /.test(s.name))
    .map((s) => ({
      key: `s${s.id}`,
      name: s.name,
      category: s.category as HelpCategory,
      emergency: s.type === 'trauma_center',
      phone: s.phone,
      address: s.address || null,
      lat: s.lat,
      lng: s.lon,
      km: Math.round((metres(at, { lat: s.lat, lng: s.lon }) / 1000) * 10) / 10,
    }))
    .sort((a, b) => rank(a) - rank(b) || a.km - b.km);
}

/** Help nearby, keyed to a ~1 km grid so panning a little does not refetch. */
export function useHelpNearby(at: LatLng | null, enabled = true) {
  const grid = at ? { lat: Math.round(at.lat * 100) / 100, lng: Math.round(at.lng * 100) / 100 } : null;
  return useQuery({
    queryKey: ['help', grid?.lat, grid?.lng],
    queryFn: ({ signal }) => fetchHelp(at!, signal),
    enabled: enabled && !!at,
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export const isMedical = (h: Help) => h.category === 'hospital' || h.category === 'clinic';

/** Rough drive time for a help row ("6 min"): road ≈ 1.3 x straight line at Pune city auto speed. */
export const driveMinutes = (km: number) => Math.max(1, Math.round(((km * 1.3) / 18) * 60));
