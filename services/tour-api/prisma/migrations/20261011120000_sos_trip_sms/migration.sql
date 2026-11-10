-- SOS / live trip sharing / SMS delivery log (Phase 5)
-- CreateTable
CREATE TABLE "TripShare" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "contactsNotified" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "TripShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "kind" TEXT NOT NULL,
    "toMasked" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripShare_sessionId_key" ON "TripShare"("sessionId");

-- CreateIndex
CREATE INDEX "TripShare_userId_endedAt_idx" ON "TripShare"("userId", "endedAt");

-- CreateIndex
CREATE INDEX "SmsMessage_userId_kind_createdAt_idx" ON "SmsMessage"("userId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "SosEvent_userId_idx" ON "SosEvent"("userId");

-- AddForeignKey
ALTER TABLE "TripShare" ADD CONSTRAINT "TripShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


