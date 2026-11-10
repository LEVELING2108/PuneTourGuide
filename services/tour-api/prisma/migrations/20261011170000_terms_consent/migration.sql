-- Consent record: when the person accepted the terms and privacy policy.
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
-- Existing email accounts accepted the terms at registration.
UPDATE "User" SET "termsAcceptedAt" = "createdAt" WHERE "password" IS NOT NULL;
