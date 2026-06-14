-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "location" geometry(Point, 4326);

-- Update existing rows to populate geometry from lat/lng
UPDATE "Place" SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326) WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;
