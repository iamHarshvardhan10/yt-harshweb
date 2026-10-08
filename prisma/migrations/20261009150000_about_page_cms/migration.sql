-- About page CMS
-- Adds a hero image upload and per-block visibility to AboutPage, and
-- visibility + timestamps to AboutStep. Additive only — no data is dropped.

-- AlterTable
ALTER TABLE "AboutPage" ADD COLUMN     "ctaVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "heroMediaId" TEXT,
ADD COLUMN     "processVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showAbout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showMetrics" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
-- updatedAt gets a temporary default so the existing steps get a value
ALTER TABLE "AboutStep" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE "AboutStep" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "AboutPage_heroMediaId_idx" ON "AboutPage"("heroMediaId");

-- CreateIndex
CREATE INDEX "AboutStep_order_idx" ON "AboutStep"("order");

-- AddForeignKey
ALTER TABLE "AboutPage" ADD CONSTRAINT "AboutPage_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
