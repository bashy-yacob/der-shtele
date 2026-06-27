-- שלב ד — פרסומות בתשלום: מודעות חסות + משרות ממומנות (prepaid, מאושרות צוות).
-- כל התוספות אדיטיביות (טבלה חדשה + עמודות nullable/עם default) → בטוח לשורות קיימות.

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('homepage', 'jobs_list', 'footer');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('draft', 'pending_payment', 'active', 'paused', 'expired');

-- CreateEnum
CREATE TYPE "AdPaymentStatus" AS ENUM ('unpaid', 'paid');

-- AlterTable — קידום משרה בתשלום (Featured). DEFAULT 'unpaid' מבצע backfill אטומי.
ALTER TABLE "jobs"
  ADD COLUMN "featuredUntil" TIMESTAMP(3),
  ADD COLUMN "featuredPaymentStatus" "AdPaymentStatus" NOT NULL DEFAULT 'unpaid',
  ADD COLUMN "featuredPaidAt" TIMESTAMP(3),
  ADD COLUMN "featuredPrice" DOUBLE PRECISION;

-- CreateTable — מודעות חסות. פרטי מפרסם (שם/טלפון/מייל/מחיר) פנימיים בלבד.
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "advertiserName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "imagePath" TEXT,
    "linkUrl" TEXT,
    "placement" "AdPlacement" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "AdStatus" NOT NULL DEFAULT 'draft',
    "paymentStatus" "AdPaymentStatus" NOT NULL DEFAULT 'unpaid',
    "paidAt" TIMESTAMP(3),
    "agreedPrice" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advertisements_placement_status_idx" ON "advertisements"("placement", "status");
