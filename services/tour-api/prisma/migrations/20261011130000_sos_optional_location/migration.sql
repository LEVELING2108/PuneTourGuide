-- An SOS may start before the phone has a GPS fix; the alert must still go out.
ALTER TABLE "SosEvent" ALTER COLUMN "lat" DROP NOT NULL;
ALTER TABLE "SosEvent" ALTER COLUMN "lng" DROP NOT NULL;
