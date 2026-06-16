-- הסרת סינון מגדרי ואישור רבני לפי איפיון v3.1.
-- מוחק את העמודות מ-jobs ו-candidates ואת טיפוס ה-enum Gender.
-- ⚠️ הרסני: מוחק את הנתונים בעמודות אלו (זו המטרה — השדות הוסרו מהמוצר).

ALTER TABLE "jobs" DROP COLUMN "gender";
ALTER TABLE "jobs" DROP COLUMN "rabbinicalApproval";
ALTER TABLE "jobs" DROP COLUMN "rabbinicalApprovalBy";

ALTER TABLE "candidates" DROP COLUMN "gender";

DROP TYPE "Gender";
