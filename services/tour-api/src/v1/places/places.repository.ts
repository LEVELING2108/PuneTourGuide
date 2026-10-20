import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { PlaceQuery } from './places.schemas';

export type PlaceRow = {
  id: number;
  name: string;
  name_mr: string | null;
  category: string;
  kind: string | null;
  area: string | null;
  address: string;
  description: string;
  description_mr: string | null;
  hours: string;
  opensAt: number | null;
  closesAt: number | null;
  entryFee: string;
  free: boolean;
  accessible: boolean;
  visitMinutes: number | null;
  weakSignal: boolean;
  xp: number;
  estYear: string;
  nearestHospitalName: string | null;
  nearestHospitalKm: number | null;
  latitude: number | null;
  longitude: number | null;
  curated: boolean;
  popularity: number;
  km: number | null;
};

const COLUMNS = Prisma.sql`p.id, p.name, p.name_mr, p.category, p.kind, p.area, p.address, p.description, p.description_mr,
  p.hours, p."opensAt", p."closesAt", p."entryFee", p.free, p.accessible, p."visitMinutes", p."weakSignal", p.xp,
  p."estYear", p."nearestHospitalName", p."nearestHospitalKm", p.latitude, p.longitude, p.curated, p.popularity`;

/** Minutes after midnight in Pune right now (for "Open now"). */
export const puneMinutesNow = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return Number(parts.hour) * 60 + Number(parts.minute);
};

function whereClause(q: PlaceQuery, userId: number | null) {
  const conds: Prisma.Sql[] = [Prisma.sql`p.latitude IS NOT NULL`];
  if (q.q) {
    const like = `%${q.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(Prisma.sql`(p.name ILIKE ${like} OR p.name_mr ILIKE ${like} OR p.area ILIKE ${like} OR p.category ILIKE ${like} OR p.kind ILIKE ${like})`);
  }
  if (q.category?.length) conds.push(Prisma.sql`p.category IN (${Prisma.join(q.category)})`);
  if (q.kind?.length) conds.push(Prisma.sql`p.kind IN (${Prisma.join(q.kind)})`);
  if (q.free) conds.push(Prisma.sql`p.free = true`);
  if (q.accessible) conds.push(Prisma.sql`p.accessible = true`);
  if (q.helpWithinKm) conds.push(Prisma.sql`p."nearestHospitalKm" <= ${q.helpWithinKm}`);
  if (q.openNow) {
    // Hide places known to be closed; unknown hours stay visible
    const now = puneMinutesNow();
    conds.push(Prisma.sql`(p."opensAt" IS NULL OR (p."opensAt" <= ${now} AND p."closesAt" > ${now}))`);
  }
  if (q.near && q.radiusKm) {
    conds.push(
      Prisma.sql`ST_DWithin(p.location::geography, ST_SetSRID(ST_MakePoint(${q.near.lng}, ${q.near.lat}), 4326)::geography, ${q.radiusKm * 1000})`
    );
  }
  if (q.saved && userId) {
    conds.push(Prisma.sql`EXISTS (SELECT 1 FROM "UserSavedPlace" s WHERE s."placeId" = p.id AND s."userId" = ${userId})`);
  }
  return Prisma.sql`WHERE ${Prisma.join(conds, ' AND ')}`;
}

export const placesRepo = {
  async search(q: PlaceQuery, userId: number | null): Promise<PlaceRow[]> {
    const km = q.near
      ? Prisma.sql`ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint(${q.near.lng}, ${q.near.lat}), 4326)::geography) / 1000`
      : Prisma.sql`NULL::float`;
    // Nearest-first with the GIST index when we know where the user is; otherwise curated + popular first
    const order = q.near
      ? Prisma.sql`ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(${q.near.lng}, ${q.near.lat}), 4326)`
      : Prisma.sql`ORDER BY p.curated DESC, p.popularity DESC, p.id`;
    return prisma.$queryRaw<PlaceRow[]>`
      SELECT ${COLUMNS}, ${km} AS km
      FROM "Place" p
      ${whereClause(q, userId)}
      ${order}
      LIMIT ${q.limit} OFFSET ${q.cursor ?? 0}`;
  },

  async count(q: PlaceQuery, userId: number | null): Promise<number> {
    const rows = await prisma.$queryRaw<{ n: number }[]>`SELECT count(*)::int AS n FROM "Place" p ${whereClause(q, userId)}`;
    return rows[0]?.n ?? 0;
  },

  async byId(id: number, near?: { lat: number; lng: number }): Promise<PlaceRow | null> {
    const km = near
      ? Prisma.sql`ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint(${near.lng}, ${near.lat}), 4326)::geography) / 1000`
      : Prisma.sql`NULL::float`;
    const rows = await prisma.$queryRaw<PlaceRow[]>`SELECT ${COLUMNS}, ${km} AS km FROM "Place" p WHERE p.id = ${id}`;
    return rows[0] ?? null;
  },

  /**
   * Places within `radiusKm` of another place, nearest first (GIST index), never the place itself.
   * `food` picks the Food category only, otherwise everything but Food. `km` is from that place.
   */
  async nearby(id: number, at: { lat: number; lng: number }, food: boolean, radiusKm: number, limit: number): Promise<PlaceRow[]> {
    const point = Prisma.sql`ST_SetSRID(ST_MakePoint(${at.lng}, ${at.lat}), 4326)`;
    return prisma.$queryRaw<PlaceRow[]>`
      SELECT ${COLUMNS}, ST_Distance(p.location::geography, ${point}::geography) / 1000 AS km
      FROM "Place" p
      WHERE p.latitude IS NOT NULL AND p.id <> ${id}
        AND ${food ? Prisma.sql`p.category = 'Food'` : Prisma.sql`p.category <> 'Food'`}
        AND ST_DWithin(p.location::geography, ${point}::geography, ${radiusKm * 1000})
      ORDER BY p.location <-> ${point}
      LIMIT ${limit}`;
  },

  async countsByCategory(): Promise<Record<string, number>> {
    const rows = await prisma.$queryRaw<{ key: string; n: number }[]>`
      SELECT category AS key, count(*)::int AS n FROM "Place" WHERE latitude IS NOT NULL GROUP BY category
      UNION ALL
      SELECT 'kind:' || kind AS key, count(*)::int AS n FROM "Place" WHERE latitude IS NOT NULL AND kind IS NOT NULL GROUP BY kind`;
    return Object.fromEntries(rows.map((r) => [r.key, r.n]));
  },

  /** Saved + in-plan flags for a set of places, for one user. */
  async userFlags(userId: number, placeIds: number[]) {
    if (!placeIds.length) return { saved: new Set<number>(), planned: new Map<number, number>() };
    const [saved, stops] = await Promise.all([
      prisma.userSavedPlace.findMany({ where: { userId, placeId: { in: placeIds } }, select: { placeId: true } }),
      prisma.itineraryStop.findMany({
        where: { placeId: { in: placeIds }, itineraryDay: { userId } },
        select: { id: true, placeId: true },
        orderBy: { id: 'asc' },
      }),
    ]);
    const planned = new Map<number, number>();
    stops.forEach((s) => s.placeId && !planned.has(s.placeId) && planned.set(s.placeId, s.id));
    return { saved: new Set(saved.map((s) => s.placeId)), planned };
  },

  exists: async (id: number) => !!(await prisma.place.findUnique({ where: { id }, select: { id: true } })),
  save: (userId: number, placeId: number) =>
    prisma.userSavedPlace.upsert({ where: { userId_placeId: { userId, placeId } }, update: {}, create: { userId, placeId } }),
  unsave: (userId: number, placeId: number) => prisma.userSavedPlace.deleteMany({ where: { userId, placeId } }),
};
