-- AlterTable
ALTER TABLE "ItineraryDay" ADD COLUMN     "date" DATE;

-- AlterTable
ALTER TABLE "ItineraryStop" ADD COLUMN     "placeId" INTEGER;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "area" TEXT,
ADD COLUMN     "closesAt" INTEGER,
ADD COLUMN     "curated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kind" TEXT,
ADD COLUMN     "nearestHospitalKm" DOUBLE PRECISION,
ADD COLUMN     "nearestHospitalName" TEXT,
ADD COLUMN     "opensAt" INTEGER,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visitMinutes" INTEGER,
ADD COLUMN     "weakSignal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 30,
ALTER COLUMN "emoji" SET DEFAULT '',
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "distance" SET DEFAULT '',
ALTER COLUMN "entryFee" SET DEFAULT '',
ALTER COLUMN "estYear" SET DEFAULT '',
ALTER COLUMN "visitTime" SET DEFAULT '',
ALTER COLUMN "hours" SET DEFAULT '',
ALTER COLUMN "phone" SET DEFAULT '',
ALTER COLUMN "address" SET DEFAULT '',
ALTER COLUMN "accessible" SET DEFAULT false,
ALTER COLUMN "guidedTours" SET DEFAULT false,
ALTER COLUMN "tag" SET DEFAULT '',
ALTER COLUMN "tagColor" SET DEFAULT '',
ALTER COLUMN "bgColor" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shakeToSos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "smsWhenOffline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN     "tripReminders" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_mr" TEXT,
    "mode" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'primary',

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "time" TEXT,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stamp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalProfile" (
    "userId" INTEGER NOT NULL,
    "bloodGroup" TEXT,
    "allergiesEnc" TEXT,
    "medicinesEnc" TEXT,
    "notesEnc" TEXT,
    "showOnLockScreen" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosEvent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "sessionId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "contactsAlerted" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "SosEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_slug_key" ON "Route"("slug");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_order_idx" ON "RouteStop"("routeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Stamp_userId_placeId_key" ON "Stamp"("userId", "placeId");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_idx" ON "EmergencyContact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "SosEvent_idempotencyKey_key" ON "SosEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ItineraryStop_itineraryDayId_order_idx" ON "ItineraryStop"("itineraryDayId", "order");

-- CreateIndex
CREATE INDEX "Place_category_idx" ON "Place"("category");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "ItineraryStop" ADD CONSTRAINT "ItineraryStop_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalProfile" ADD CONSTRAINT "MedicalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosEvent" ADD CONSTRAINT "SosEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ── Manual additions ─────────────────────────────────────────────

-- Link existing itinerary stops to their place by name (stops only stored copies before)
UPDATE "ItineraryStop" s
SET "placeId" = (
  SELECT p.id FROM "Place" p
  WHERE lower(p.name) = lower(s.name)
  ORDER BY p.id
  LIMIT 1
)
WHERE s."placeId" IS NULL;

-- Spatial index for "near me" queries (ST_DWithin / <->)
CREATE INDEX IF NOT EXISTS "place_location_gist" ON "Place" USING GIST ("location");

-- Keep the PostGIS point in sync with latitude/longitude on every write
CREATE OR REPLACE FUNCTION place_sync_location() RETURNS trigger AS $$
BEGIN
  IF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
    NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326);
  ELSE
    NEW."location" := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS place_sync_location ON "Place";
CREATE TRIGGER place_sync_location
BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "Place"
FOR EACH ROW EXECUTE FUNCTION place_sync_location();

UPDATE "Place" SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL AND "location" IS NULL;

-- Existing OSM categories map onto the new catalogue
UPDATE "Place" SET "kind" = 'Food lane' WHERE "category" = 'Food' AND "kind" IS NULL;
