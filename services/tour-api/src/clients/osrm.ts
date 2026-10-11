import axios from 'axios';
import { env } from '../config/env';
import { decodePolyline } from '../lib/polyline';

export type Profile = 'foot' | 'car';
export type LatLng = { lat: number; lng: number };

export type OsrmStep = {
  type: string;
  modifier: string | null;
  name: string;
  distanceM: number;
  durationS: number;
  lat: number;
  lng: number;
};

export type OsrmRoute = {
  distanceM: number;
  durationS: number;
  geometry: [number, number][];
  legs: { distanceM: number; durationS: number }[];
  steps: OsrmStep[];
};

// The public demo servers are for development only (TECH_DESIGN §3); production sets a
// provider or self-hosted OSRM through OSRM_URL / OSRM_FOOT_URL.
const base = (profile: Profile) => (profile === 'foot' ? env.OSRM_FOOT_URL : env.OSRM_URL);
const coords = (pts: LatLng[]) => pts.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
const http = axios.create({ timeout: 8000, headers: { 'User-Agent': 'PuneExplorer/2.0' } });

/** Travel-time matrix in seconds (null where no route exists). */
export async function osrmTable(pts: LatLng[], profile: Profile): Promise<(number | null)[][]> {
  const { data } = await http.get(`${base(profile)}/table/v1/driving/${coords(pts)}`, { params: { annotations: 'duration' } });
  if (data?.code !== 'Ok' || !Array.isArray(data.durations)) throw new Error(`OSRM table: ${data?.code ?? 'no data'}`);
  return data.durations;
}

/** Route through the points in order, with turn-by-turn steps. */
export async function osrmRoute(pts: LatLng[], profile: Profile): Promise<OsrmRoute> {
  const { data } = await http.get(`${base(profile)}/route/v1/driving/${coords(pts)}`, {
    params: { overview: 'full', geometries: 'polyline6', steps: true },
  });
  const r = data?.routes?.[0];
  if (data?.code !== 'Ok' || !r) throw new Error(`OSRM route: ${data?.code ?? 'no route'}`);
  type RawStep = { maneuver: { type: string; modifier?: string; location: [number, number] }; name?: string; distance: number; duration: number };
  type RawLeg = { distance: number; duration: number; steps: RawStep[] };
  return {
    distanceM: r.distance,
    durationS: r.duration,
    geometry: decodePolyline(r.geometry, 6),
    legs: (r.legs as RawLeg[]).map((l) => ({ distanceM: l.distance, durationS: l.duration })),
    steps: (r.legs as RawLeg[]).flatMap((l) =>
      l.steps.map((s) => ({
        type: s.maneuver.type,
        modifier: s.maneuver.modifier ?? null,
        name: s.name ?? '',
        distanceM: s.distance,
        durationS: s.duration,
        lat: s.maneuver.location[1],
        lng: s.maneuver.location[0],
      }))
    ),
  };
}
