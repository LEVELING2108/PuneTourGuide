import { getCachedData, setCachedData } from '../../services/cacheService';
import { notFound } from '../../lib/errors';
import { placesRepo, puneMinutesNow, type PlaceRow } from './places.repository';
import type { PlaceQuery } from './places.schemas';

const CACHE_TTL = 600; // 10 minutes (TECH_DESIGN §9.1)

/** "Also nearby" on a place: close by first, wider for places out of town (forts, hills). */
const NEARBY_KM = 3;
const NEARBY_WIDE_KM = 10;
const NEARBY_MIN = 3;
const NEARBY_LIMIT = 6;

const round1 = (n: number | null) => (n === null || n === undefined ? null : Math.round(n * 10) / 10);

const isOpen = (row: PlaceRow, now = puneMinutesNow()) =>
  row.opensAt === null || row.closesAt === null ? null : row.opensAt <= now && row.closesAt > now;

export type PlaceDto = ReturnType<typeof toDto>;

function toDto(row: PlaceRow) {
  return {
    id: row.id,
    name: row.name,
    nameMr: row.name_mr,
    category: row.category,
    kind: row.kind,
    area: row.area,
    km: round1(row.km),
    hospital: row.nearestHospitalName ? { name: row.nearestHospitalName, km: round1(row.nearestHospitalKm) } : null,
    weakSignal: row.weakSignal,
    free: row.free,
    accessible: row.accessible,
    xp: row.xp,
    hours: row.hours || null,
    openNow: isOpen(row),
    entryFee: row.entryFee || null,
    visitMinutes: row.visitMinutes,
    lat: row.latitude,
    lng: row.longitude,
    curated: row.curated,
    isSaved: false,
    planStopId: null as number | null,
    /** When the user collected this place's stamp (ISO), or null. */
    visitedAt: null as string | null,
  };
}

function toDetail(row: PlaceRow) {
  return {
    ...toDto(row),
    description: row.description,
    descriptionMr: row.description_mr,
    address: row.address,
    estYear: row.estYear || null,
  };
}

/** Location rounded to ~500 m so nearby users share cache entries. */
const cacheKey = (q: PlaceQuery) => {
  const near = q.near ? `${q.near.lat.toFixed(3)},${q.near.lng.toFixed(3)}` : '-';
  return `tour:places:v1:${JSON.stringify({ ...q, near })}`;
};

async function annotate<T extends PlaceDto>(items: T[], userId: number | null): Promise<T[]> {
  if (!userId || !items.length) return items;
  const flags = await placesRepo.userFlags(userId, items.map((p) => p.id));
  return items.map((p) => ({
    ...p,
    isSaved: flags.saved.has(p.id),
    planStopId: flags.planned.get(p.id) ?? null,
    visitedAt: flags.visited.get(p.id)?.toISOString() ?? null,
  }));
}

export const placesService = {
  async list(q: PlaceQuery, userId: number | null) {
    const userSpecific = !!q.saved;
    const key = cacheKey(q);
    let items = userSpecific ? null : await getCachedData<PlaceDto[]>(key);
    if (!items) {
      items = (await placesRepo.search(q, userId)).map(toDto);
      if (!userSpecific && !q.openNow) await setCachedData(key, items, CACHE_TTL);
    }
    const offset = q.cursor ?? 0;
    return {
      items: await annotate(items, userId),
      nextCursor: items.length === q.limit ? offset + q.limit : null,
    };
  },

  async count(q: PlaceQuery, userId: number | null) {
    return placesRepo.count(q, userId);
  },

  async detail(id: number, userId: number | null, near?: { lat: number; lng: number }) {
    const row = await placesRepo.byId(id, near);
    if (!row) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    const [dto] = await annotate([toDetail(row)], userId);
    return dto;
  },

  /**
   * Places and food near a place. Rows are cached per place (they only change when the catalogue does);
   * open/closed and the user's plan flags are worked out per request. Closed places go last.
   */
  async nearby(id: number, userId: number | null) {
    const key = `tour:places:v1:nearby:${id}`;
    let rows = await getCachedData<{ places: PlaceRow[]; food: PlaceRow[] }>(key);
    if (!rows) {
      const place = await placesRepo.byId(id);
      if (!place) throw notFound('PLACE_NOT_FOUND', 'Place not found');
      if (place.latitude === null || place.longitude === null) {
        rows = { places: [], food: [] };
      } else {
        const at = { lat: place.latitude, lng: place.longitude };
        const pick = async (food: boolean) => {
          const wide = await placesRepo.nearby(id, at, food, NEARBY_WIDE_KM, NEARBY_LIMIT);
          const close = wide.filter((r) => (r.km ?? Infinity) <= NEARBY_KM);
          return close.length >= NEARBY_MIN ? close : wide;
        };
        const [places, food] = await Promise.all([pick(false), pick(true)]);
        rows = { places, food };
      }
      await setCachedData(key, rows, CACHE_TTL * 6);
    }
    // Stable sort: nearest first, with places known to be closed right now moved to the end
    const order = (list: PlaceRow[]) => list.map(toDto).sort((a, b) => Number(a.openNow === false) - Number(b.openNow === false));
    const [places, food] = await Promise.all([annotate(order(rows.places), userId), annotate(order(rows.food), userId)]);
    return { places, food };
  },

  async categoryCounts() {
    const key = 'tour:places:v1:category-counts';
    const cached = await getCachedData<Record<string, number>>(key);
    if (cached) return cached;
    const counts = await placesRepo.countsByCategory();
    await setCachedData(key, counts, CACHE_TTL);
    return counts;
  },

  async visit(userId: number, placeId: number) {
    const row = await placesRepo.byId(placeId);
    if (!row) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    const r = await placesRepo.visit(userId, placeId, row.xp);
    return { placeId, ...r, visitedAt: r.visitedAt.toISOString() };
  },

  async setSaved(userId: number, placeId: number, saved: boolean) {
    if (!(await placesRepo.exists(placeId))) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    if (saved) await placesRepo.save(userId, placeId);
    else await placesRepo.unsave(userId, placeId);
    return { placeId, isSaved: saved };
  },
};
