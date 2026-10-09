import { overpass, type OsmElement } from '../../clients/overpass';
import { getCachedData, invalidateCache, setCachedData } from '../../services/cacheService';
import { helpRepo, type HelpNear, type HelpRow } from './help.repository';

/** Pune city, PCMC and the fort/ghat trails around it (Sinhagad, Torna, Lonavala, Rajgad). */
export const HELP_BBOX = { south: 18.2, west: 73.4, north: 18.85, east: 74.2 };
const CATEGORIES = ['hospital', 'clinic', 'police', 'fire_station'] as const;

const inBox = (lat: number, lng: number) =>
  lat >= HELP_BBOX.south && lat <= HELP_BBOX.north && lng >= HELP_BBOX.west && lng <= HELP_BBOX.east;

/** First phone number of an OSM phone tag, kept only if it is dialable. */
export function cleanPhone(raw: string | undefined): string | null {
  const first = raw?.split(/[;,/]/)[0]?.trim();
  if (!first) return null;
  const tel = first.replace(/[^\d+]/g, '');
  return /^\+?\d{6,15}$/.test(tel) ? tel : null;
}

/** OSM element → HelpPlace row. Unnamed points are skipped: a traveller cannot ask for them. */
export function toHelpRow(el: OsmElement): HelpRow | null {
  const t = el.tags ?? {};
  const category = t.amenity;
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return null;
  const name = (t['name:en'] || t.name || '').trim();
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!name || lat === undefined || lng === undefined) return null;
  // A house number alone ("489") means nothing to a traveller; only use it with a street.
  const street = t['addr:street'] ? [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ') : '';
  const address = t['addr:full'] || [street, t['addr:suburb'] || t['addr:city']].filter(Boolean).join(', ') || null;
  // OSM tags maternity homes, eye and dental hospitals as amenity=hospital. They cannot take an
  // accident case, so they count as clinics: "nearest hospital" must mean somewhere that can.
  const speciality = `${name} ${t['healthcare:speciality'] ?? ''}`;
  const kind = category === 'hospital' && SPECIALIST.test(speciality) && t.emergency !== 'yes' ? 'clinic' : category;
  return {
    osmId: `${el.type}/${el.id}`,
    name: name.slice(0, 160),
    category: kind,
    emergency: t.emergency === 'yes',
    phone: cleanPhone(t.phone || t['contact:phone'] || t['contact:mobile'] || t['emergency:phone']),
    address: address ? address.slice(0, 200) : null,
    lat,
    lng,
  };
}

const metres = (a: HelpRow, b: HelpRow) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180 * Math.cos((a.lat * Math.PI) / 180);
  return 6371000 * Math.sqrt(dLat * dLat + dLng * dLng);
};
const info = (r: HelpRow) => (r.emergency ? 4 : 0) + (r.phone ? 2 : 0) + (r.address ? 1 : 0);

/**
 * OSM often maps one hospital twice (a point and its building). Same name within 300 m is one
 * place: keep the most complete record, and keep it as an emergency hospital if either says so.
 */
export function dedupe(rows: HelpRow[]): HelpRow[] {
  const byName = new Map<string, HelpRow[]>();
  for (const r of rows) {
    const k = `${r.category}:${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    byName.set(k, [...(byName.get(k) ?? []), r]);
  }
  const out: HelpRow[] = [];
  for (const group of byName.values()) {
    const kept: HelpRow[] = [];
    for (const r of group.sort((a, b) => info(b) - info(a))) {
      const twin = kept.find((k) => metres(k, r) < 300);
      if (!twin) kept.push({ ...r });
      else {
        twin.emergency ||= r.emergency;
        twin.phone ??= r.phone;
        twin.address ??= r.address;
      }
    }
    out.push(...kept);
  }
  return out;
}

const SPECIALIST =
  /matern|gyna?ec|obstet|\beye\b|ophthalm|netra|dental|dentist|skin|derma|ivf|fertility|ayurved|homo?eo|physio|psychiatr|de-?addiction|cosmetic|hair|\bent\b|urolog|diabet|cancer|onco|dialysis|veterin/i;

/** Trauma care first: 24x7 emergency hospitals, hospitals, police and fire, then clinics; nearest-first within each. */
const rank = (h: HelpNear) =>
  h.category === 'hospital' ? (h.emergency ? 0 : 1) : h.category === 'police' || h.category === 'fire_station' ? 2 : 3;

export const helpService = {
  /**
   * Import every named hospital, clinic, police and fire station in the Pune area from
   * OpenStreetMap, drop points OSM no longer has, then refresh each place's nearest hospital.
   */
  async refresh(log: (msg: string) => void = () => undefined) {
    const { south, west, north, east } = HELP_BBOX;
    const q = `[out:json][timeout:180];nwr["amenity"~"^(${CATEGORIES.join('|')})$"](${south},${west},${north},${east});out center tags;`;
    const seenAt = new Date();
    log('Querying OpenStreetMap (Overpass)…');
    const elements = await overpass(q);
    const rows = new Map<string, HelpRow>();
    for (const el of elements) {
      const r = toHelpRow(el);
      if (r) rows.set(r.osmId, r);
    }
    const list = dedupe([...rows.values()]);
    // A tiny answer means a broken mirror, not a city without hospitals: keep the old data.
    if (list.filter((r) => r.category === 'hospital').length < 50) {
      throw new Error(`Only ${list.length} usable points came back; refusing to replace the existing data`);
    }
    await helpRepo.upsertMany(list, seenAt);
    const removed = await helpRepo.deleteNotSeen(seenAt);
    const places = await helpRepo.refreshPlaceHospitals();
    await invalidateCache('tour:help:*');
    await invalidateCache('tour:places:*');
    const byCat = Object.fromEntries(CATEGORIES.map((c) => [c, list.filter((r) => r.category === c).length]));
    log(`Imported ${list.length} points ${JSON.stringify(byCat)}, removed ${removed.count}, updated ${places} places`);
    return { imported: list.length, removed: removed.count, placesUpdated: places, byCategory: byCat };
  },

  /** Help near a point. `covered` is false outside the imported area, so the app can ask the live service. */
  async near(lat: number, lng: number, radiusKm: number, limit: number) {
    if (!inBox(lat, lng)) return { covered: false, items: [] as HelpNear[] };
    const key = `tour:help:${lat.toFixed(2)},${lng.toFixed(2)}:${radiusKm}:${limit}`;
    const cached = await getCachedData<{ covered: boolean; items: HelpNear[] }>(key);
    if (cached) return cached;
    const rows = await helpRepo.near(lat, lng, radiusKm, Math.min(200, limit * 3));
    // Hospitals outnumber police stations ten to one; always keep the nearest few police / fire.
    const ranked = rows.map((r, i) => ({ r, i })).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i);
    const safety = ranked.filter(({ r }) => rank(r) === 2).slice(0, 3);
    const items = [...ranked.filter((x) => !safety.includes(x)).slice(0, limit - safety.length), ...safety]
      .sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i)
      .map(({ r }) => r);
    // Not covered until the first import has run, so the app falls back to the live service.
    const result = { covered: items.length > 0 || (await helpRepo.count()) > 0, items };
    await setCachedData(key, result, 10 * 60);
    return result;
  },
};
