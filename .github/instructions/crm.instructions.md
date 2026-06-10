---
name: CRM Internal
description: כללים לפיתוח מערכת ה-CRM הפנימי (שלב ב)
applyTo: 'src/app/admin/**,src/app/api/admin/**'
---

# CRM פנימי — כללים

## הרשאות
- כל route תחת `/api/admin/` חייב לאמת JWT לפני כל דבר אחר
- role נדרש: `admin` בלבד — אין רמות הרשאה נוספות בשלב זה
- תגובת 401 לאנשים לא מחוברים, 403 להרשאה חסרה

```ts
// תבנית חובה לכל admin route
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError; // 401 / 403
  // ... המשך
}
```

## מידע רגיש — מעסיקים
- פרטי מעסיק (שם, ח.פ, איש קשר) קיימים **רק** ב-DB ורק ב-admin routes
- ה-type `FullEmployer` (שלב ב) לעולם לא מיובא בקומפוננטות ציבוריות
- לתמיד לוגר גישה למידע רגיש: `console.info('[ADMIN ACCESS]', userId, action)`

## סטטוסים — לא לשנות ישירות
מעברי סטטוס של מועמד ומשרה מוגדרים ב-`lib/statusMachine.ts` (שלב ב).
אין לעדכן status ישירות ב-DB מבלי לעבור דרך הפונקציות שם.

## ממשק עברית
גם ממשק ה-CRM הפנימי — עברית בלבד, RTL מלא.
```
