-- Refresh tokens remember when they were rotated, for the concurrent-refresh grace window
ALTER TABLE "RefreshToken" ADD COLUMN "rotatedAt" TIMESTAMP(3);
