-- ניסיון נדרש (גלוי לציבור) ושכר מוצע (פנימי) במשרה.
-- שתי העמודות nullable — תואם-לאחור, משרות קיימות לא מושפעות.

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "experience" TEXT,
ADD COLUMN     "salary" TEXT;
