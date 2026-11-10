
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "deccanSummary" TEXT,
ADD COLUMN     "deccanTitle" TEXT,
ADD COLUMN     "sort" INTEGER NOT NULL DEFAULT 0;

