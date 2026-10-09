-- Investigations CMS
-- Each investigation links a YouTube video to its research documents in
-- English and Hindi. New tables only — nothing existing is changed.

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentLanguage" AS ENUM ('EN', 'HI');

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATE,
    "youtubeVideoId" TEXT,
    "keyFindings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationDocument" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "language" "DocumentLanguage" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "pages" INTEGER,
    "readMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestigationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investigation_slug_key" ON "Investigation"("slug");

-- CreateIndex
CREATE INDEX "Investigation_status_order_idx" ON "Investigation"("status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationDocument_investigationId_language_key" ON "InvestigationDocument"("investigationId", "language");

-- AddForeignKey
ALTER TABLE "InvestigationDocument" ADD CONSTRAINT "InvestigationDocument_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

