-- AlterTable
ALTER TABLE "Place" ADD COLUMN "googlePlaceId" TEXT;

-- CreateTable
CREATE TABLE "SpotVisit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "googlePlaceId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotVisit_userId_googlePlaceId_key" ON "SpotVisit"("userId", "googlePlaceId");

-- AddForeignKey
ALTER TABLE "SpotVisit" ADD CONSTRAINT "SpotVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
