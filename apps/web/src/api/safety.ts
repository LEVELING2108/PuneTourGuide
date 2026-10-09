/**
 * Safety service (RoadSoS FastAPI): public, no login. Served at /safety (proxied in dev).
 * Data is live OpenStreetMap via Overpass, cached per ~1 km area by the service.
 */
export const SAFETY_BASE = (import.meta.env.VITE_SAFETY_URL as string | undefined) ?? '/safety';

export type HelpPlace = {
  id: number;
  name: string;
  category: string;
  type: string;
  phone: string | null;
  lat: number;
  lon: number;
  address: string;
  is_recommended: boolean;
  distance: number | null;
};

export const safetyApi = {
  async emergencyServices(lat: number, lng: number, signal?: AbortSignal): Promise<HelpPlace[]> {
    const qs = new URLSearchParams({ lat: lat.toFixed(3), lng: lng.toFixed(3), radius: '5000' });
    const res = await fetch(`${SAFETY_BASE}/api/emergency-services?${qs}`, { signal });
    if (!res.ok) throw new Error(`Help nearby unavailable (${res.status})`);
    const json = (await res.json()) as { services?: HelpPlace[] };
    return json.services ?? [];
  },
};
