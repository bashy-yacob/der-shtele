-- שלבים 1–3 לסגירת פערי האיפיון (2026-06-24):
--  1. מודל סטטוס העמלה: not_due → due → invoiced → paid (חוק הברזל).
--  2. אירוע "העמלה נכנסה לגבייה" בלוג הגיוס.
--  3. אימות כתובת מייל (User).
--  4. הסכמת דיוור בטופס צור-קשר (Contact) — חוק הספאם.
--
-- ⚠️ DB משותף עם prod. להריץ `npx prisma migrate deploy` רק לאחר שהקוד החדש
--    עלה (ראה רצף הפריסה ב-docs/code-review-findings.md). השלב הרגיש היחיד הוא
--    שינוי השם pending→not_due — לפרוס קוד+מיגרציה בסמיכות.

-- ── 1. CommissionStatus: pending→not_due + ערך חדש 'due' ────────────
-- RENAME שומר על השורות הקיימות (pending הופך אוטומטית ל-not_due).
ALTER TYPE "CommissionStatus" RENAME VALUE 'pending' TO 'not_due';
ALTER TYPE "CommissionStatus" ADD VALUE 'due' AFTER 'not_due';
ALTER TABLE "placements" ALTER COLUMN "commissionStatus" SET DEFAULT 'not_due';

-- ── 2. PlacementEventType: אירוע 'commission_due' ──────────────────
ALTER TYPE "PlacementEventType" ADD VALUE 'commission_due' AFTER 'cancelled';

-- ── 3. User: אימות כתובת מייל ──────────────────────────────────────
ALTER TABLE "users"
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verificationToken" TEXT,
  ADD COLUMN "verificationSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- ── 4. Contact: הסכמת דיוור (חוק הספאם) ───────────────────────────
ALTER TABLE "contacts"
  ADD COLUMN "optInMarketing" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "optInAt" TIMESTAMP(3);
