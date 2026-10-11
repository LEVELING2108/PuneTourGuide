import axios from 'axios';
import { sharedRedis } from '../services/cacheService';

let lastCall = 0;

/** Wait for the next 1-second slot, shared across every API instance through Redis. */
async function takeSlot(): Promise<boolean> {
  const redis = sharedRedis();
  if (!redis) {
    const wait = lastCall + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    return true;
  }
  for (let i = 0; i < 4; i++) {
    if (await redis.set('tour:nominatim:slot', '1', 'PX', 1100, 'NX').catch(() => 'OK')) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false; // busy: callers treat this as no result rather than queueing forever
}

/** Nominatim search biased to the Pune region. Public server policy: max 1 request per second. */
export async function geocode(q: string): Promise<{ name: string; lat: number; lng: number } | null> {
  if (!(await takeSlot())) return null;

  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q, format: 'jsonv2', limit: 1, viewbox: '73.40,18.90,74.20,18.20', bounded: 0, countrycodes: 'in' },
    headers: { 'User-Agent': 'PuneExplorer/2.0 (https://github.com/LEVELING2108/PuneTourGuide)' },
    timeout: 6000,
  });
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;
  return { name: String(hit.name || hit.display_name).split(',')[0], lat: Number(hit.lat), lng: Number(hit.lon) };
}
