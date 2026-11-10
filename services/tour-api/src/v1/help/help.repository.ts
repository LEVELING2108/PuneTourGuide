import { prisma } from '../../lib/prisma';

export type HelpRow = {
  osmId: string;
  name: string;
  category: string;
  emergency: boolean;
  phone: string | null;
  address: string | null;
  lat: number;
  lng: number;
};

export type HelpNear = {
  id: number;
  name: string;
  category: string;
  emergency: boolean;
  phone: string | null;
  address: string | null;
  lat: number;
  lng: number;
  km: number;
};

export const helpRepo = {
  /** Bulk upsert in one statement per chunk (UNNEST), marking every row as seen by this run. */
  async upsertMany(rows: HelpRow[], seenAt: Date) {
    for (let i = 0; i < rows.length; i += 1000) {
      const c = rows.slice(i, i + 1000);
      await prisma.$executeRaw`
        INSERT INTO "HelpPlace" ("osmId", "name", "category", "emergency", "phone", "address", "latitude", "longitude", "seenAt", "updatedAt")
        -- Prisma keeps DateTime as UTC wall-clock in timestamp(3); convert explicitly, never via the session time zone.
        SELECT u.*, (${seenAt.toISOString()}::timestamptz AT TIME ZONE 'UTC'), (now() AT TIME ZONE 'UTC')
        FROM UNNEST(
          ${c.map((r) => r.osmId)}::text[], ${c.map((r) => r.name)}::text[], ${c.map((r) => r.category)}::text[],
          ${c.map((r) => r.emergency)}::boolean[], ${c.map((r) => r.phone)}::text[], ${c.map((r) => r.address)}::text[],
          ${c.map((r) => r.lat)}::float8[], ${c.map((r) => r.lng)}::float8[]
        ) AS u("osmId", "name", "category", "emergency", "phone", "address", "latitude", "longitude")
        ON CONFLICT ("osmId") DO UPDATE SET
          "name" = EXCLUDED."name", "category" = EXCLUDED."category", "emergency" = EXCLUDED."emergency",
          "phone" = EXCLUDED."phone", "address" = EXCLUDED."address", "latitude" = EXCLUDED."latitude",
          "longitude" = EXCLUDED."longitude", "seenAt" = EXCLUDED."seenAt", "updatedAt" = EXCLUDED."updatedAt"`;
    }
  },

  /** Remove points that a complete import no longer saw (closed or deleted in OSM). */
  deleteNotSeen: (seenAt: Date) => prisma.helpPlace.deleteMany({ where: { seenAt: { lt: seenAt } } }),

  count: () => prisma.helpPlace.count(),

  /** Nearest-first help points within a radius (GIST index via <->). */
  near: (lat: number, lng: number, radiusKm: number, limit: number) =>
    prisma.$queryRaw<HelpNear[]>`
      WITH here AS (SELECT ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) AS g)
      SELECT h."id", h."name", h."category", h."emergency", h."phone", h."address",
             h."latitude" AS lat, h."longitude" AS lng,
             ROUND((ST_Distance(h."location"::geography, here.g::geography) / 1000)::numeric, 1)::float8 AS km
      FROM "HelpPlace" h, here
      WHERE ST_DWithin(h."location"::geography, here.g::geography, ${radiusKm * 1000})
      ORDER BY h."location" <-> here.g
      LIMIT ${limit}`,

  /** Each place's nearest hospital, from the imported OSM hospitals. */
  refreshPlaceHospitals: () =>
    prisma.$executeRaw`
      UPDATE "Place" p SET ("nearestHospitalName", "nearestHospitalKm") = (
        SELECT h."name", ROUND((ST_Distance(h."location"::geography, p."location"::geography) / 1000)::numeric, 1)::float8
        FROM "HelpPlace" h
        WHERE h."category" = 'hospital'
        ORDER BY h."location" <-> p."location"
        LIMIT 1
      )
      WHERE p."location" IS NOT NULL AND EXISTS (SELECT 1 FROM "HelpPlace" WHERE "category" = 'hospital')`,
};
