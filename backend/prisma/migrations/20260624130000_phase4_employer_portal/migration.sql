-- שלב 4 — פורטל מעסיקים (2026-06-24):
--  1. role חדש 'employer' למשתמשי פורטל.
--  2. סטטוס משרה 'pending' — זרימת אישור צוות לפני שמשרת מעסיק עולה לאתר.
--  3. קישור User → Employer (משתמש פורטל משויך למעסיק).
--
-- שינויים תוספתיים בלבד (ADD VALUE / ADD COLUMN nullable) — בטוחים לקוד הישן
-- עד שהקוד החדש נפרס. הערכים החדשים אינם בשימוש במיגרציה עצמה.

-- ── 1. UserRole += employer ────────────────────────────────────────
ALTER TYPE "UserRole" ADD VALUE 'employer';

-- ── 2. JobStatus += pending ────────────────────────────────────────
ALTER TYPE "JobStatus" ADD VALUE 'pending' BEFORE 'active';

-- ── 3. User → Employer ─────────────────────────────────────────────
ALTER TABLE "users" ADD COLUMN "employerId" TEXT;
ALTER TABLE "users"
  ADD CONSTRAINT "users_employerId_fkey"
  FOREIGN KEY ("employerId") REFERENCES "employers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
