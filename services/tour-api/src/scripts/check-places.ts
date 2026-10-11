/**
 * Launch check (docs/LAUNCH_SETUP.md step 13): compares each curated place's pin with
 * OpenStreetMap and lists the ones that are far apart, so they can be corrected before launch.
 *   npm run check:places -w services/tour-api
 * Uses the public Nominatim search at most once a second (its usage policy).
 */
import { haversineKm, PLACES } from '../seed/catalogue';

const UA = 'PuneExplorer/2.0 (launch data check; https://github.com/LEVELING2108/PuneTourGuide)';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Searches that find the right OpenStreetMap feature where the display name alone finds another one. */
const QUERY: Record<string, string> = {
  'Parvati Hill': 'Parvati Temple, Pune',
  'Goodluck Cafe': 'Good Luck Cafe, Deccan Gymkhana, Pune',
  'Rajgad Fort': 'Rajgad, Velhe',
};

/** Checked by hand (2026-10-11): OpenStreetMap has no matching feature, or only a trailhead. */
const CHECKED: Record<string, string> = {
  'Sarasbaug Ganpati': 'not in OSM search; pin on the Saras Baug temple',
  'Torna Fort': 'OSM finds the trek start; the pin is the summit',
  'Laxmi Road food lane': 'a stretch of road; pin near Belbaug chowk',
  'FC Road food lane': 'a stretch of road; pin on FC Road',
};

async function lookup(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  const [hit] = (await r.json()) as { lat: string; lon: string; display_name: string }[];
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } : null;
}

async function main() {
  const rows: { place: string; status: string; off: string; osm: string }[] = [];
  for (const p of PLACES) {
    if (CHECKED[p.name]) {
      rows.push({ place: p.name, status: 'ok (by hand)', off: '-', osm: CHECKED[p.name] });
      continue;
    }
    let hit = await lookup(QUERY[p.name] ?? `${p.name}, Pune, Maharashtra`);
    await sleep(1100);
    if (!hit) {
      hit = await lookup(`${p.name}, Maharashtra`);
      await sleep(1100);
    }
    if (!hit) {
      rows.push({ place: p.name, status: 'NOT FOUND', off: '-', osm: '-' });
      continue;
    }
    const d = haversineKm(p, hit);
    rows.push({
      place: p.name,
      status: d <= 0.3 ? 'ok' : d <= 1.5 ? 'CHECK' : 'WRONG?',
      off: d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`,
      osm: `${hit.lat.toFixed(5)}, ${hit.lng.toFixed(5)}  ${hit.label.slice(0, 60)}`,
    });
  }
  console.table(rows);
  const bad = rows.filter((r) => !r.status.startsWith('ok'));
  console.log(`\n${rows.length - bad.length} of ${rows.length} pins confirmed (within 300 m of OpenStreetMap, or checked by hand).`);
  if (bad.length) console.log('Open the CHECK / WRONG? / NOT FOUND ones on a map and correct catalogue.ts where needed.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
