-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "notifiedAt" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "token" TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_token_idx" ON "Subscriber"("token");


-- Posts published before this migration count as already announced, so
-- editing an old post never emails subscribers
UPDATE "Post" SET "notifiedAt" = "publishedAt" WHERE "status" = 'published';
