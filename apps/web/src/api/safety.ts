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

export type TrackingSession = { session_id: string; publish_token: string; expires_in: number };

/** Live-location sessions (safety service). Only the creator holds the publish token. */
export const trackingApi = {
  async create(): Promise<TrackingSession> {
    const res = await fetch(`${SAFETY_BASE}/api/create-session`, { method: 'POST' });
    if (!res.ok) throw new Error(`Could not start live location (${res.status})`);
    return res.json();
  },
  async close(s: { session_id: string; publish_token: string }) {
    await fetch(`${SAFETY_BASE}/api/close-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
      keepalive: true,
    }).catch(() => undefined);
  },
  /** ws(s):// URL for a session. The sharing phone authenticates with its first message. */
  socketUrl(sessionId: string) {
    const base = SAFETY_BASE.startsWith('http') ? SAFETY_BASE : `${location.origin}${SAFETY_BASE}`;
    return `${base.replace(/^http/, 'ws')}/ws/track/${encodeURIComponent(sessionId)}`;
  },
};
