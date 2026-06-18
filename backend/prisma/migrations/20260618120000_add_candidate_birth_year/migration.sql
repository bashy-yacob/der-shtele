-- שנת לידה (אופציונלי) למועמד — נמסרת בהגשת קו"ח למשרה ספציפית.
-- nullable — תואם-לאחור, נתונים קיימים לא מושפעים.

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "birthYear" INTEGER;
