-- Baseline: the database as it existed before the home page CMS migration
-- (replaces the remote-only migrations 20261008193758_init and 20261008195015_about_page)

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."AboutPage" (
    "id" TEXT NOT NULL DEFAULT 'about',
    "heroTag" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDesc" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "processTag" TEXT NOT NULL,
    "processTitle" TEXT NOT NULL,
    "processDesc" TEXT NOT NULL,
    "ctaTag" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaDesc" TEXT NOT NULL,
    "ctaBtn1" TEXT NOT NULL,
    "ctaBtn1Link" TEXT NOT NULL,
    "ctaBtn2" TEXT NOT NULL,
    "ctaBtn2Link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AboutStep" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AboutStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeAboutItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "HomeAboutItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeFaq" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "HomeFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeMetric" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "HomeMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomePage" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "heroTag" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDesc" TEXT NOT NULL,
    "heroBtn1" TEXT NOT NULL,
    "heroBtn1Link" TEXT NOT NULL,
    "heroBtn2" TEXT NOT NULL,
    "heroBtn2Link" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "videosTag" TEXT NOT NULL,
    "videosTitle" TEXT NOT NULL,
    "metricsTag" TEXT NOT NULL,
    "metricsTitle" TEXT NOT NULL,
    "metricsDesc" TEXT NOT NULL,
    "aboutTag" TEXT NOT NULL,
    "aboutTitle" TEXT NOT NULL,
    "aboutDesc" TEXT NOT NULL,
    "aboutImage" TEXT NOT NULL,
    "reviewsTag" TEXT NOT NULL,
    "reviewsTitle" TEXT NOT NULL,
    "reviewsDesc" TEXT NOT NULL,
    "faqTag" TEXT NOT NULL,
    "faqTitle" TEXT NOT NULL,
    "faqDesc" TEXT NOT NULL,
    "contactTag" TEXT NOT NULL,
    "contactTitle" TEXT NOT NULL,
    "contactDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeTestimonial" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "HomeTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeVideo" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "publishedAt" DATE NOT NULL,

    CONSTRAINT "HomeVideo_pkey" PRIMARY KEY ("id")
);

