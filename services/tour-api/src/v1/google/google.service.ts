import { GoogleApiError, googleConfigured, googlePlaces, type GooglePlace } from '../../clients/googlePlaces';
import { notFound } from '../../lib/errors';
import { haversineKm } from '../../lib/geo';
import { photoKind, takeGoogleBudget, type GoogleKind } from '../../lib/googleBudget';
import { logger } from '../../lib/logger';
import { sharedRedis } from '../../services/cacheService';
import { googleRepo } from './google.repository';

/**
 * Live Google Maps data for places and side quests (TECH_DESIGN §9.13). Google content is never
 * stored or cached by the server (Maps Platform terms): only place ids are kept. Every call takes a
 * unit of the daily budget first; when Google is off, capped or failing, callers get
 * { available: false } and the app carries on with its own data.
 */
export const SIDE_QUEST_XP = 10;
// Popular-first within a walkable radius in the city; out of town (forts, dams, hills) spots are spread wider
const CITY_CENTRE = { lat: 18.5204, lng: 73.8567 };
const CITY_KM = 10;
export const searchRadiusM = (at: { lat: number; lng: number }) => (haversineKm(CITY_CENTRE, at) > CITY_KM ? 5000 : 1500);
const ROW_MAX = 8;
// Viewpoints, trails, waterfalls and landmarks are tagged as these on Google Maps
const SIDE_QUEST_TYPES = ['tourist_attraction', 'hiking_area', 'park', 'observation_deck', 'historical_landmark', 'national_park'];
const FOOD_TYPES = ['restaurant', 'cafe', 'tea_house', 'bakery'];
// Hotels and resorts also carry "restaurant"; the Food row keeps places whose main business is food
const FOOD_PRIMARY = /restaurant|cafe|coffee|tea|bakery|food|snack|sweet|dessert|juice|meal|dhaba/;

export type Unavailable = { available: false; reason: 'not-configured' | 'daily-limit' | 'not-linked' | 'unavailable' };
const off = (reason: Unavailable['reason']): Unavailable => ({ available: false, reason });

/** Google place ids: letters, digits, "-" and "_". Photo names: places/{id}/photos/{ref}. */
export const GOOGLE_ID = /^[A-Za-z0-9_-]{10,300}$/;
export const PHOTO_NAME = /^places\/[A-Za-z0-9_-]{10,300}\/photos\/[A-Za-z0-9_-]{10,1000}$/;

/** Run one Google call within the daily budget; null (with a reason) when it can't. */
async function guarded<T>(kind: GoogleKind, run: () => Promise<T>): Promise<T | Unavailable> {
  if (!googleConfigured()) return off('not-configured');
  if (!(await takeGoogleBudget(kind))) return off('daily-limit');
  try {
    return await run();
  } catch (e) {
    // Status and Google's error code only: the request config holds the key
    logger.warn({ kind, status: e instanceof GoogleApiError ? e.status : 0, code: e instanceof GoogleApiError ? e.code : 'ERROR' }, 'google places call failed');
    return off('unavailable');
  }
}

const isOff = (x: unknown): x is Unavailable => typeof x === 'object' && x !== null && (x as Unavailable).available === false;

// Spots we've shown (place ids may be stored indefinitely): only these can be claimed for XP without a lookup.
const KNOWN_KEY = 'tour:google:known-spots';
const knownMemory = new Set<string>();
async function rememberSpots(ids: string[]) {
  if (!ids.length) return;
  ids.forEach((id) => knownMemory.add(id));
  try {
    await sharedRedis()?.sadd(KNOWN_KEY, ...ids);
  } catch {
    // Memory copy is enough for this instance
  }
}
async function isKnownSpot(id: string) {
  if (knownMemory.has(id)) return true;
  try {
    return (await sharedRedis()?.sismember(KNOWN_KEY, id)) === 1;
  } catch {
    return false;
  }
}

const photoOf = (g: GooglePlace) => g.photos[0] ?? null;

function spotCard(g: GooglePlace, from: { lat: number; lng: number } | null, visited: Map<string, Date>) {
  return {
    googleId: g.id,
    name: g.name,
    type: g.type,
    rating: g.rating,
    ratingCount: g.ratingCount,
    openNow: g.openNow,
    km: from && g.lat !== null && g.lng !== null ? Math.round(haversineKm(from, { lat: g.lat, lng: g.lng }) * 10) / 10 : null,
    photo: photoOf(g),
    mapsUri: g.mapsUri,
    visitedAt: visited.get(g.id)?.toISOString() ?? null,
  };
}

export const googleService = {
  /** Rating, open now and a photo for one of our places. */
  async place(id: number) {
    const place = await googleRepo.place(id);
    if (!place) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    if (!place.googlePlaceId) return off(googleConfigured() ? 'not-linked' : 'not-configured');
    const g = await guarded('details', () => googlePlaces.details(place.googlePlaceId!, 1));
    if (isOff(g)) return g;
    return { available: true as const, rating: g.rating, ratingCount: g.ratingCount, openNow: g.openNow, hours: g.hours, mapsUri: g.mapsUri, photo: photoOf(g) };
  },

  /** Side quests and food around one of our places, popular first, never our own catalogue. */
  async nearby(id: number, userId: number | null) {
    const place = await googleRepo.place(id);
    if (!place) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    if (place.latitude === null || place.longitude === null) return off('unavailable');
    const at = { lat: place.latitude, lng: place.longitude };
    const radius = searchRadiusM(at);
    const [quests, food, ours] = await Promise.all([
      guarded('nearby', () => googlePlaces.nearby(at, SIDE_QUEST_TYPES, radius)),
      guarded('nearby', () => googlePlaces.nearby(at, FOOD_TYPES, radius)),
      googleRepo.catalogueGoogleIds(),
    ]);
    if (isOff(quests) && isOff(food)) return quests;
    const keep = (list: GooglePlace[] | Unavailable, ok: (g: GooglePlace) => boolean = () => true) =>
      isOff(list) ? [] : list.filter((g) => !ours.has(g.id) && ok(g)).slice(0, ROW_MAX);
    const [q, f] = [keep(quests), keep(food, (g) => FOOD_PRIMARY.test(g.primaryType ?? ''))];
    const ids = [...q, ...f].map((g) => g.id);
    await rememberSpots(ids);
    const visited = userId ? await googleRepo.visitedSpots(userId, ids) : new Map<string, Date>();
    return { available: true as const, sideQuests: q.map((g) => spotCard(g, at, visited)), food: f.map((g) => spotCard(g, at, visited)) };
  },

  /** A side quest's page: photos, rating, hours, address, Google Maps link. */
  async spot(googleId: string, userId: number | null) {
    const g = await guarded('details', () => googlePlaces.details(googleId, 3));
    if (isOff(g)) return g;
    await rememberSpots([g.id]);
    const visited = userId ? await googleRepo.visitedSpots(userId, [g.id]) : new Map<string, Date>();
    return {
      available: true as const,
      ...spotCard(g, null, visited),
      photos: g.photos,
      hours: g.hours,
      address: g.address,
      lat: g.lat,
      lng: g.lng,
      xp: SIDE_QUEST_XP,
    };
  },

  /** Short-lived image URL for a Google photo; the app is redirected to it. */
  async photoUrl(name: string, width: number) {
    const uri = await guarded(photoKind(width), () => googlePlaces.photoUri(name, width));
    return isOff(uri) ? null : uri;
  },

  /** "Been here?" on a side quest: +XP once. Only spots the app has shown can be claimed. */
  async visitSpot(userId: number, googleId: string) {
    if (!(await isKnownSpot(googleId))) throw notFound('SPOT_NOT_FOUND', 'Open this side quest in the app first');
    const r = await googleRepo.visitSpot(userId, googleId, SIDE_QUEST_XP);
    return { googleId, ...r, visitedAt: r.visitedAt.toISOString() };
  },
};

/** Test helper. */
export const resetKnownSpots = () => knownMemory.clear();
