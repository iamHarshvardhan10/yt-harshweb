-- Home page CMS
-- Moves the existing home content into HomeHero / HomeSection and extends the
-- list tables. No existing rows or columns are dropped.

-- CreateEnum
CREATE TYPE "HomeSectionKey" AS ENUM ('FEATURED_VIDEOS', 'METRICS', 'ABOUT', 'TESTIMONIALS', 'FAQ', 'CONTACT');

-- CreateEnum
CREATE TYPE "MediaResourceType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "HeroBackgroundType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "HomeHeroMediaRole" AS ENUM ('BACKGROUND_IMAGE', 'BACKGROUND_VIDEO');


-- ---------------------------------------------------------------------------
-- List tables: add visibility + timestamps.
-- updatedAt is added with a temporary default so existing rows get a value,
-- then the default is dropped (Prisma's @updatedAt sets it from the client).
-- ---------------------------------------------------------------------------

-- AlterTable
ALTER TABLE "HomeMetric" RENAME COLUMN "label" TO "title";
ALTER TABLE "HomeMetric" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE "HomeMetric" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "HomeAboutItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE "HomeAboutItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "HomeTestimonial" ADD COLUMN     "avatarId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL;
ALTER TABLE "HomeTestimonial" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "HomeFaq" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE "HomeFaq" ALTER COLUMN "updatedAt" DROP DEFAULT;


-- ---------------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------------

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "resourceType" "MediaResourceType" NOT NULL,
    "originalName" TEXT,
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "folder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryButtonName" TEXT,
    "primaryButtonUrl" TEXT,
    "secondaryButtonName" TEXT,
    "secondaryButtonUrl" TEXT,
    "backgroundType" "HeroBackgroundType" NOT NULL DEFAULT 'IMAGE',
    "darkOverlay" BOOLEAN NOT NULL DEFAULT false,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 65,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "loop" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeHeroMedia" (
    "id" TEXT NOT NULL,
    "homeHeroId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "role" "HomeHeroMediaRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeHeroMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "key" "HomeSectionKey" NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);


-- ---------------------------------------------------------------------------
-- Indexes & foreign keys
-- ---------------------------------------------------------------------------

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Media_publicId_key" ON "Media"("publicId");

-- CreateIndex
CREATE INDEX "HomeHeroMedia_homeHeroId_idx" ON "HomeHeroMedia"("homeHeroId");

-- CreateIndex
CREATE INDEX "HomeHeroMedia_mediaId_idx" ON "HomeHeroMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeHeroMedia_homeHeroId_role_key" ON "HomeHeroMedia"("homeHeroId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSection_key_key" ON "HomeSection"("key");

-- CreateIndex
CREATE INDEX "HomeSection_mediaId_idx" ON "HomeSection"("mediaId");

-- CreateIndex
CREATE INDEX "HomeAboutItem_order_idx" ON "HomeAboutItem"("order");

-- CreateIndex
CREATE INDEX "HomeFaq_order_idx" ON "HomeFaq"("order");

-- CreateIndex
CREATE INDEX "HomeMetric_order_idx" ON "HomeMetric"("order");

-- CreateIndex
CREATE INDEX "HomeTestimonial_order_idx" ON "HomeTestimonial"("order");

-- CreateIndex
CREATE INDEX "HomeTestimonial_avatarId_idx" ON "HomeTestimonial"("avatarId");

-- AddForeignKey
ALTER TABLE "HomeHeroMedia" ADD CONSTRAINT "HomeHeroMedia_homeHeroId_fkey" FOREIGN KEY ("homeHeroId") REFERENCES "HomeHero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeHeroMedia" ADD CONSTRAINT "HomeHeroMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeSection" ADD CONSTRAINT "HomeSection_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeTestimonial" ADD CONSTRAINT "HomeTestimonial_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Data: copy the existing HomePage row into HomeHero + HomeSection.
-- heroImage / aboutImage are /public paths that the site already uses as
-- fallbacks, so they are not turned into Media rows.
-- ---------------------------------------------------------------------------

INSERT INTO "HomeHero" (
    "id", "eyebrow", "headline", "description",
    "primaryButtonName", "primaryButtonUrl", "secondaryButtonName", "secondaryButtonUrl",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text, "heroTag", "heroTitle", "heroDesc",
    NULLIF("heroBtn1", ''), NULLIF("heroBtn1Link", ''), NULLIF("heroBtn2", ''), NULLIF("heroBtn2Link", ''),
    CURRENT_TIMESTAMP
FROM "HomePage"
LIMIT 1;

INSERT INTO "HomeSection" ("id", "key", "eyebrow", "title", "description", "updatedAt")
SELECT gen_random_uuid()::text, s."key"::"HomeSectionKey", s."eyebrow", s."title", NULLIF(s."description", ''), CURRENT_TIMESTAMP
FROM (SELECT * FROM "HomePage" LIMIT 1) p
CROSS JOIN LATERAL (VALUES
    ('FEATURED_VIDEOS', p."videosTag",  p."videosTitle",  NULL),
    ('METRICS',         p."metricsTag", p."metricsTitle", p."metricsDesc"),
    ('ABOUT',           p."aboutTag",   p."aboutTitle",   p."aboutDesc"),
    ('TESTIMONIALS',    p."reviewsTag", p."reviewsTitle", p."reviewsDesc"),
    ('FAQ',             p."faqTag",     p."faqTitle",     p."faqDesc"),
    ('CONTACT',         p."contactTag", p."contactTitle", p."contactDesc")
) AS s("key", "eyebrow", "title", "description");
