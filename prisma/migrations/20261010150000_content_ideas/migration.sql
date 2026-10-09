-- Content ideas
-- Planned videos and Shorts with their stage and planned upload time.
-- New table only — nothing existing is changed.


-- CreateEnum
CREATE TYPE "ContentIdeaType" AS ENUM ('VIDEO', 'SHORT');

-- CreateEnum
CREATE TYPE "IdeaStage" AS ENUM ('IDEA', 'RESEARCH', 'SCRIPT', 'EDITING', 'READY', 'UPLOADED');

-- CreateEnum
CREATE TYPE "IdeaPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "category" TEXT,
    "type" "ContentIdeaType" NOT NULL DEFAULT 'VIDEO',
    "stage" "IdeaStage" NOT NULL DEFAULT 'IDEA',
    "priority" "IdeaPriority" NOT NULL DEFAULT 'MEDIUM',
    "uploadAt" TIMESTAMP(3),
    "youtubeVideoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentIdea_stage_idx" ON "ContentIdea"("stage");

-- CreateIndex
CREATE INDEX "ContentIdea_uploadAt_idx" ON "ContentIdea"("uploadAt");

