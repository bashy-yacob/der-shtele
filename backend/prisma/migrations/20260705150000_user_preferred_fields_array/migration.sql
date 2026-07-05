-- תחום תעסוקה מבוקש — הפיכה לרב-בחירה: preferredField (יחיד) → preferredFields (מערך).
-- תוספת אדיטיבית בלבד (כמו מיגרציית partners): מוסיפים עמודת מערך וממלאים מהערך
-- היחיד הקיים. את העמודה הישנה preferredField משאירים מוקפאת — כדי שקוד ישן שרץ
-- בזמן הפריסה (חלון של דקות ב-Render) לא יישבר. ניקוי במיגרציה נפרדת לאחר פריסה מלאה.
-- ⚠️ ה-DB ב-Supabase משותף dev+prod — להריץ `prisma migrate deploy` רק לאחר אישור מפורש.

-- 1) עמודת מערך חדשה (ברירת מחדל: ריק)
ALTER TABLE "users" ADD COLUMN "preferredFields" "JobField"[] NOT NULL DEFAULT ARRAY[]::"JobField"[];

-- 2) גיבוי הערך היחיד הקיים לתוך המערך (רק היכן שהוגדר תחום)
UPDATE "users" SET "preferredFields" = ARRAY["preferredField"] WHERE "preferredField" IS NOT NULL;
