import { createHash } from 'crypto';
import { notFound } from '../../lib/errors';
import { getCachedData, setCachedData } from '../../services/cacheService';
import { offlineRepo, type BBox } from './offline.repository';

type PackDef = { id: string; name: string; nameMr: string; bbox: BBox; minZoom: number; maxZoom: number };

/**
 * Offline areas (TECH_DESIGN §9.9): small on purpose (a city area or one fort trail),
 * each around places in the catalogue. Zoom 12–16/17 is enough to find your way and help.
 */
export const PACKS: PackDef[] = [
  { id: 'old-pune', name: 'Old Pune peths', nameMr: 'जुने पुणे · पेठा', bbox: { south: 18.505, west: 73.84, north: 18.532, east: 73.872 }, minZoom: 13, maxZoom: 17 },
  { id: 'shivajinagar', name: 'Shivajinagar & Deccan', nameMr: 'शिवाजीनगर · डेक्कन', bbox: { south: 18.508, west: 73.825, north: 18.545, east: 73.858 }, minZoom: 13, maxZoom: 16 },
  { id: 'sinhagad', name: 'Sinhagad Fort', nameMr: 'सिंहगड', bbox: { south: 18.345, west: 73.735, north: 18.4, east: 73.79 }, minZoom: 12, maxZoom: 16 },
  { id: 'rajgad', name: 'Rajgad Fort', nameMr: 'राजगड', bbox: { south: 18.225, west: 73.66, north: 18.268, east: 73.705 }, minZoom: 12, maxZoom: 16 },
  { id: 'torna', name: 'Torna Fort', nameMr: 'तोरणा', bbox: { south: 18.255, west: 73.6, north: 18.297, east: 73.646 }, minZoom: 12, maxZoom: 16 },
  { id: 'lohagad', name: 'Lohagad Fort', nameMr: 'लोहगड', bbox: { south: 18.69, west: 73.455, north: 18.728, east: 73.5 }, minZoom: 12, maxZoom: 16 },
];

/** India's emergency numbers, always in every pack. */
export const EMERGENCY_NUMBERS = [
  { number: '112', label: 'All emergencies' },
  { number: '108', label: 'Ambulance' },
  { number: '100', label: 'Police' },
  { number: '101', label: 'Fire' },
  { number: '1091', label: 'Women helpline' },
  { number: '1098', label: 'Child helpline' },
  { number: '1033', label: 'Highway emergency (NHAI)' },
];

/** Average raster tile weight used to estimate download size. */
const TILE_BYTES = 18_000;

const tileXY = (lat: number, lng: number, z: number) => {
  const n = 2 ** z;
  const r = (lat * Math.PI) / 180;
  return {
    x: Math.floor(((lng + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n),
  };
};

/** Every z/x/y tile in the pack's box (the client fetches exactly this list). */
export function tilesFor(p: Pick<PackDef, 'bbox' | 'minZoom' | 'maxZoom'>) {
  const out: [number, number, number][] = [];
  for (let z = p.minZoom; z <= p.maxZoom; z++) {
    const a = tileXY(p.bbox.north, p.bbox.west, z);
    const b = tileXY(p.bbox.south, p.bbox.east, z);
    for (let x = a.x; x <= b.x; x++) for (let y = a.y; y <= b.y; y++) out.push([z, x, y]);
  }
  return out;
}

async function bundleFor(def: PackDef) {
  const key = `tour:offline:${def.id}`;
  const cached = await getCachedData<ReturnType<typeof build>>(key);
  if (cached) return cached;
  const [places, help] = await Promise.all([offlineRepo.places(def.bbox), offlineRepo.help(def.bbox)]);
  function build() {
    const body = {
      id: def.id,
      name: def.name,
      nameMr: def.nameMr,
      bbox: def.bbox,
      minZoom: def.minZoom,
      maxZoom: def.maxZoom,
      generatedAt: new Date().toISOString(),
      numbers: EMERGENCY_NUMBERS,
      places: places.map((p) => ({
        id: p.id,
        name: p.name,
        nameMr: p.name_mr,
        category: p.category,
        area: p.area,
        lat: p.latitude,
        lng: p.longitude,
        hours: p.hours || null,
        entryFee: p.entryFee || null,
        weakSignal: p.weakSignal,
        hospital: p.nearestHospitalName ? { name: p.nearestHospitalName, km: p.nearestHospitalKm } : null,
      })),
      help: help.map((h) => ({ name: h.name, category: h.category, emergency: h.emergency, phone: h.phone, address: h.address, lat: h.latitude, lng: h.longitude })),
    };
    const version = createHash('sha256').update(JSON.stringify({ ...body, generatedAt: '' })).digest('hex').slice(0, 12);
    return { ...body, version };
  }
  const bundle = build();
  await setCachedData(key, bundle, 3600);
  return bundle;
}

export const offlineService = {
  /** Packs with real sizes and counts; when logged in, which ones cover places in your plan. */
  async list(userId: number | null) {
    return Promise.all(
      PACKS.map(async (def) => {
        const b = await bundleFor(def);
        const tiles = tilesFor(def).length;
        const plan = userId ? await offlineRepo.planPlaces(userId, def.bbox) : [];
        return {
          id: def.id,
          name: def.name,
          nameMr: def.nameMr,
          bbox: def.bbox,
          minZoom: def.minZoom,
          maxZoom: def.maxZoom,
          version: b.version,
          tileCount: tiles,
          tileBytes: tiles * TILE_BYTES,
          dataBytes: Buffer.byteLength(JSON.stringify(b)),
          places: b.places.length,
          hospitals: b.help.filter((h) => h.category === 'hospital').length,
          police: b.help.filter((h) => h.category === 'police').length,
          weakSignal: b.places.some((p) => p.weakSignal),
          inPlan: [...new Set(plan.map((s) => s.place?.name).filter(Boolean))] as string[],
          planDays: [...new Set(plan.map((s) => s.itineraryDay.day))].sort(),
        };
      })
    );
  },

  async bundle(id: string) {
    const def = PACKS.find((p) => p.id === id);
    if (!def) throw notFound('PACK_NOT_FOUND', 'Offline pack not found');
    return { ...(await bundleFor(def)), tiles: tilesFor(def) };
  },
};
