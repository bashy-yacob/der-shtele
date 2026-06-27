-- הוספת סטטוס אישור למעסיק — תמיכה בהרשמה עצמית כ"בקשת גישה" (סעיף 6).
-- מעסיקים קיימים אומתו ידנית ע"י הצוות, ולכן backfill ל-approved. רק הרשמה
-- עצמית חדשה תיווצר כ-pending (נכפה ב-service, לא ב-default).

CREATE TYPE "EmployerStatus" AS ENUM ('pending', 'approved', 'rejected');

-- status נוסף עם DEFAULT approved — כך כל השורות הקיימות מקבלות approved
-- באותו statement (backfill אטומי). approvedAt/rejectionReason nullable.
ALTER TABLE "employers"
  ADD COLUMN "status" "EmployerStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "rejectionReason" TEXT;

-- חותמת approvedAt לשורות ותיקות (לתיעוד; הן אושרו בעבר).
UPDATE "employers" SET "approvedAt" = "createdAt" WHERE "approvedAt" IS NULL;

CREATE INDEX "employers_status_idx" ON "employers"("status");
