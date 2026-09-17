-- CreateEnum
CREATE TYPE "HeroBackgroundType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryButtonName" TEXT,
    "primaryButtonUrl" TEXT,
    "secondaryButtonName" TEXT,
    "secondaryButtonUrl" TEXT,
    "backgroundType" "HeroBackgroundType" NOT NULL DEFAULT 'IMAGE',
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "videoUrl" TEXT,
    "videoPublicId" TEXT,
    "darkOverlay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);
