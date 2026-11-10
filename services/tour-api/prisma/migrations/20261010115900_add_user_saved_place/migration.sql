-- UserSavedPlace existed in some databases (created with db push) but was never in the migration
-- history, so fresh databases lacked it. Idempotent: safe where the table already exists.
CREATE TABLE IF NOT EXISTS "UserSavedPlace" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSavedPlace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserSavedPlace_userId_placeId_key" ON "UserSavedPlace"("userId", "placeId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSavedPlace_userId_fkey') THEN
    ALTER TABLE "UserSavedPlace" ADD CONSTRAINT "UserSavedPlace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSavedPlace_placeId_fkey') THEN
    ALTER TABLE "UserSavedPlace" ADD CONSTRAINT "UserSavedPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
