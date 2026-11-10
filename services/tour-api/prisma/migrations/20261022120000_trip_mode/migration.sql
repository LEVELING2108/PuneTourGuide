-- AlterTable
ALTER TABLE "ItineraryStop" ADD COLUMN "doneAt" TIMESTAMP(3),
ADD COLUMN "xpAwarded" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TripShare" ADD COLUMN "smsLogIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateTable
CREATE TABLE "DayRun" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dayId" INTEGER,
    "dayNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,
    "skipped" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "placesVisited" INTEGER,
    "xpEarned" INTEGER,
    "km" DOUBLE PRECISION,

    CONSTRAINT "DayRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DayRun_userId_endedAt_idx" ON "DayRun"("userId", "endedAt");

-- One running day per user, even when two devices tap Start at the same moment
CREATE UNIQUE INDEX "DayRun_one_running_per_user" ON "DayRun"("userId") WHERE "endedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "DayRun" ADD CONSTRAINT "DayRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayRun" ADD CONSTRAINT "DayRun_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ItineraryDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
