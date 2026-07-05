-- שותפים — לוגואים של חנויות/מעסיקים שהסכימו להופיע ("עם מי אנחנו עובדים").
-- תוספת אדיטיבית בלבד (טבלה חדשה) → בטוח לשורות/טבלאות קיימות.
-- ⚠️ ה-DB ב-Supabase משותף dev+prod — להריץ `prisma migrate deploy` רק לאחר אישור מפורש.

-- CreateTable — שותפים. לוגו בלבד (ללא תמונות אנשים); כל שותף מאושר ידנית ע"י הצוות.
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "logoPath" TEXT NOT NULL,
    "linkUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partners_isActive_displayOrder_idx" ON "partners"("isActive", "displayOrder");
