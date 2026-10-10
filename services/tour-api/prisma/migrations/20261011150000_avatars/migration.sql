-- Profile photos (Phase 6)
-- CreateTable
CREATE TABLE "Avatar" (
    "key" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "mime" TEXT NOT NULL DEFAULT 'image/webp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


