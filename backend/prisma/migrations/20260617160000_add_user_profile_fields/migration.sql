-- פרטי פרופיל לדיוור מותאם אישית ב-User (עיר, תחום מבוקש, טלפון, שנות ניסיון).
-- כל העמודות nullable — תואם-לאחור, נתונים קיימים לא מושפעים.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "preferredField" "JobField",
ADD COLUMN     "yearsExperience" INTEGER;
