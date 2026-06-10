# Der Shtele — הנחיות לכלי AI

## על הפרויקט
סוכנות השמה דיגיטלית לציבור החרדי בישראל.
מודל: כל קשר בין מועמד למעסיק עובר דרך הצוות (2 נציגים).
מעסיקים אנונימיים לחלוטין באתר הציבורי.

## ערמת טכנולוגיה
- **Framework**: Next.js 14, App Router
- **שפה**: TypeScript (strict mode)
- **עיצוב**: Tailwind CSS — class utilities בלבד, ללא inline styles
- **ולידציה**: Zod + React Hook Form
- **אחסון**: Supabase Storage (קורות חיים)
- **מייל**: Nodemailer / Resend
- **DB**: PostgreSQL + Prisma (שלב ב)

## התחלה מהירה
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`

## איך להשתמש בהנחיות האלו
- קובץ זה הוא ההנחיה הראשית ל-AI בבסיס.
- קבצי הנחיה נוספים ב-`.github/instructions/` מספקים כללים מפורטים ל-React, TypeScript, API routes ו-CRM.
- קישורים חשובים:
  - `.github/instructions/components.instructions.md`
  - `.github/instructions/typescript.instructions.md`
  - `.github/instructions/api-routes.instructions.md`
  - `.github/instructions/crm.instructions.md`

## כללים קריטיים — לא לסטות מהם

### RTL ועברית
- כל טקסט פונה לציבור חייב להיות **בעברית בלבד**
- ה-HTML הראשי: `<html lang="he" dir="rtl">`
- אין לערבב כיווניות — לא להוסיף `dir="ltr"` על אלמנטים בודדים בלי סיבה מפורשת
- פונט: Heebo (מוגדר ב-globals.css) — לא להחליף

### עיצוב חרדי / צנוע
- **אסור לחלוטין**: תמונות של אנשים (גברים או נשים) בכל מקום באתר
- **אסור**: פרסומות, באנרים צבעוניים, אנימציות קשות
- **מותר**: אייקונים מופשטים, גרפיקה ניטרלית
- עיצוב שמרני — primary-600 כצבע ראשי, ניטרל לרקע
- כפתורים ראשיים: class `btn-primary`, משניים: class `btn-outline`

### הפרדת מידע ציבורי/פנימי
- שם המעסיק **לעולם לא** מופיע בקומפוננטות ציבוריות
- ה-type `PublicJob` מכיל רק מה שמותר לציבור לראות
- כל מידע רגיש שייך ל-CRM בלבד (שלב ב)

### שבת ויום טוב
- אין לשלוח התראות / מיילים אוטומטיים בשבת וחג
- בשלב ב — לבדוק לפי לוח שנה עברי לפני כל שליחה

## מבנה ותבניות

### קבצים
```
src/
├── app/           # דפים ו-API routes (Next.js App Router)
├── components/    # רכיבים — layout / jobs / forms / ui
├── lib/           # constants, mockData, validations, utils
├── types/         # index.ts — כל הטיפוסים המשותפים
└── styles/        # globals.css בלבד
```

### טיפוסים — תמיד מ-`@/types`
```ts
// ✅ נכון
import type { PublicJob, Gender, Region } from '@/types';

// ❌ לא להגדיר types מקומיים שכבר קיימים ב-types/index.ts
```

### רכיבים
- רכיב = קובץ אחד, named export (לא default export בתוך components/)
- Props עם interface מפורש — תמיד
- שמות בעברית לפרופס פנימיים מותר, אך שמות הפונקציות/קבצים — באנגלית

```tsx
// ✅ דוגמה נכונה
interface JobCardProps {
  job: PublicJob;
  showApplyButton?: boolean;
}
export function JobCard({ job, showApplyButton = true }: JobCardProps) { ... }
```

### API Routes
- תמיד מחזירים `ApiResponse<T>` מ-`@/types`
- ולידציה עם Zod לפני כל עיבוד
- שגיאות: status 400 לקלט לא תקין, 500 לשגיאת שרת

```ts
// ✅ מבנה API route תקני
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: '...' }, { status: 400 });
  // ... לוגיקה
  return NextResponse.json({ success: true, data: result });
}
```

## מה לא לעשות
- לא להוסיף ספריות UI חיצוניות (MUI, Chakra, shadcn) — Tailwind בלבד
- לא להשתמש ב-`any` — לטפל בשגיאות TypeScript כמו שצריך
- לא לשים לוגיקת עסקים בתוך קומפוננטות — לחלץ ל-`lib/`
- לא לחשוף env variables ל-client (רק `NEXT_PUBLIC_` אם הכרחי)
- לא להשתמש ב-`useEffect` לפטיות שניתן לפתור ב-server component
