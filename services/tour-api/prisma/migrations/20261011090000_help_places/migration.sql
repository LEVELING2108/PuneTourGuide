-- Emergency help points imported from OpenStreetMap (hospitals, clinics, police, fire stations).

-- CreateTable
CREATE TABLE "HelpPlace" (
    "id" SERIAL NOT NULL,
    "osmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" geometry(Point, 4326),
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelpPlace_osmId_key" ON "HelpPlace"("osmId");

-- CreateIndex
CREATE INDEX "HelpPlace_category_idx" ON "HelpPlace"("category");

-- Nearest-first and radius queries
CREATE INDEX IF NOT EXISTS "helpplace_location_gist" ON "HelpPlace" USING GIST ("location");

-- Keep "location" in step with latitude/longitude (same pattern as Place)
CREATE OR REPLACE FUNCTION helpplace_sync_location() RETURNS trigger AS $$
BEGIN
  NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS helpplace_sync_location ON "HelpPlace";
CREATE TRIGGER helpplace_sync_location
BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "HelpPlace"
FOR EACH ROW EXECUTE FUNCTION helpplace_sync_location();
