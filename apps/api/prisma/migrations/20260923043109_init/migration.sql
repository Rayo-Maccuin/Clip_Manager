-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'SELECTED', 'EDITED', 'PUBLISHED', 'DISCARDED');

-- CreateTable
CREATE TABLE "Stream" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "vodUrl" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" UUID NOT NULL,
    "streamId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "ClipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipTag" (
    "clipId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "ClipTag_pkey" PRIMARY KEY ("clipId","tagId")
);

-- CreateIndex
CREATE INDEX "Stream_startedAt_idx" ON "Stream"("startedAt");

-- CreateIndex
CREATE INDEX "Clip_streamId_idx" ON "Clip"("streamId");

-- CreateIndex
CREATE INDEX "Clip_status_idx" ON "Clip"("status");

-- CreateIndex
CREATE INDEX "Clip_streamId_timestamp_idx" ON "Clip"("streamId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ClipTag_tagId_idx" ON "ClipTag"("tagId");

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipTag" ADD CONSTRAINT "ClipTag_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipTag" ADD CONSTRAINT "ClipTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
