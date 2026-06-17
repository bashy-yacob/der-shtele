-- המרת אזור/עיר (region) מ-enum לטקסט חופשי כדי לאפשר הוספת ערים חדשות אוטומטית.
-- ממיר את העמודות ב-jobs ו-candidates ל-TEXT, ממפה את ערכי ה-enum הישנים לשמות
-- הערים בעברית (הערך המאוחסן = תווית התצוגה), ואז מסיר את טיפוס ה-enum Region.

-- 1) המרת סוג העמודה ל-TEXT (חייב לקרות לפני שאפשר לכתוב ערכים שאינם enum)
ALTER TABLE "jobs" ALTER COLUMN "region" TYPE TEXT USING "region"::text;
ALTER TABLE "candidates" ALTER COLUMN "region" TYPE TEXT USING "region"::text;

-- 2) מיפוי ערכי ה-enum הישנים לשמות הערים בעברית
UPDATE "jobs" SET "region" = CASE "region"
  WHEN 'bnei_brak'   THEN 'בני ברק'
  WHEN 'jerusalem'   THEN 'ירושלים'
  WHEN 'elad'        THEN 'אלעד'
  WHEN 'modiin_ilit' THEN 'מודיעין עילית'
  WHEN 'beitar_ilit' THEN 'ביתר עילית'
  WHEN 'other'       THEN 'אחר'
  ELSE "region" END;

UPDATE "candidates" SET "region" = CASE "region"
  WHEN 'bnei_brak'   THEN 'בני ברק'
  WHEN 'jerusalem'   THEN 'ירושלים'
  WHEN 'elad'        THEN 'אלעד'
  WHEN 'modiin_ilit' THEN 'מודיעין עילית'
  WHEN 'beitar_ilit' THEN 'ביתר עילית'
  WHEN 'other'       THEN 'אחר'
  ELSE "region" END;

-- 3) הסרת טיפוס ה-enum (כבר לא בשימוש)
DROP TYPE "Region";
