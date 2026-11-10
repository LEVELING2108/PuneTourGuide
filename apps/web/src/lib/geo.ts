export type LatLng = { lat: number; lng: number };
export type Pair = [number, number];

const RAD = Math.PI / 180;

/** Great-circle distance in metres. */
export function metres(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(s)));
}

const ll = (p: Pair): LatLng => ({ lat: p[0], lng: p[1] });

/** Index of the geometry vertex closest to `p`, searching from `from` onwards. */
export function closestIndex(line: Pair[], p: LatLng, from = 0): number {
  let best = from;
  let bestD = Infinity;
  for (let i = from; i < line.length; i++) {
    const d = metres(ll(line[i]), p);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Distance in metres from `p` to the nearest vertex of the line (good enough for off-route checks). */
export const offRouteMetres = (line: Pair[], p: LatLng) => (line.length ? metres(ll(line[closestIndex(line, p)]), p) : Infinity);

/** Distance along the line between two vertex indexes. */
export function alongMetres(line: Pair[], from: number, to: number): number {
  let total = 0;
  for (let i = Math.max(0, from); i < Math.min(to, line.length - 1); i++) total += metres(ll(line[i]), ll(line[i + 1]));
  return total;
}

/** Split a route's geometry into legs at the vertices closest to each waypoint. */
export function splitLegs(line: Pair[], waypoints: LatLng[]): Pair[][] {
  if (line.length < 2 || waypoints.length < 2) return [];
  const cuts = [0];
  for (let i = 1; i < waypoints.length - 1; i++) cuts.push(closestIndex(line, waypoints[i], cuts[cuts.length - 1]));
  cuts.push(line.length - 1);
  return cuts.slice(1).map((end, i) => line.slice(cuts[i], end + 1));
}

/** "650 m", "1.2 km", "12 km" */
export function distText(m: number): string {
  if (m < 50) return `${Math.max(5, Math.round(m / 5) * 5)} m`;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return m < 10000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 1000)} km`;
}

/** "8 min", "1 hr 5 min" */
export function durText(s: number): string {
  const min = Math.max(1, Math.round(s / 60));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}

/** Clock time in Pune, e.g. "11:22". */
export const clockIn = (seconds: number, now = Date.now()) =>
  new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
    .format(new Date(now + seconds * 1000))
    .replace(/\s?[ap]m$/i, '');

/** Midpoint vertex of a line, for leg labels. */
export const midpoint = (line: Pair[]): Pair => line[Math.floor(line.length / 2)];

/** Escape text for marker HTML (place and OSM names are data, never markup). */
export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** "18.5195,73.8553" → a point, or null if missing or out of range. */
export function parseAt(v: string | null): LatLng | null {
  const m = v?.match(/^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}
