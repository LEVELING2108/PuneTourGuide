import axios from 'axios';

let lastCall = 0;

/** Nominatim search biased to the Pune region. Public server policy: max 1 request per second. */
export async function geocode(q: string): Promise<{ name: string; lat: number; lng: number } | null> {
  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q, format: 'jsonv2', limit: 1, viewbox: '73.40,18.90,74.20,18.20', bounded: 0, countrycodes: 'in' },
    headers: { 'User-Agent': 'PuneExplorer/2.0 (https://github.com/LEVELING2108/PuneTourGuide)' },
    timeout: 6000,
  });
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;
  return { name: String(hit.name || hit.display_name).split(',')[0], lat: Number(hit.lat), lng: Number(hit.lon) };
}
