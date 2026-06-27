# דער שטעלע — Der Shtele

סוכנות השמה דיגיטלית לציבור החרדי בישראל.
**מודל:** כל קשר בין מועמד למעסיק עובר דרך הצוות. מעסיקים אנונימיים לחלוטין באתר הציבורי.

## ארכיטקטורה — Monorepo

```
der-shtele/
├── frontend/   # Next.js 14 (App Router) — האתר הציבורי + אזורים אישיים
├── backend/    # NestJS — לוגיקה עסקית, DB (Prisma/PostgreSQL), מיילים, אחסון
├── tasks/      # מסמכי שלבים (phase-a/b/c)
└── docs/       # מפרט
```

ה-frontend לא ניגש ל-DB ישירות — כל הנתונים עוברים דרך ה-API של ה-backend
(`frontend/src/lib/api.ts`). זה שומר על הפרדת מידע ציבורי/פנימי.

## ערמת טכנולוגיה

| שכבה     | טכנולוגיה                                 |
| -------- | ----------------------------------------- |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, RTL |
| ולידציה  | Zod + React Hook Form                     |
| Backend  | NestJS, TypeScript                        |
| DB       | PostgreSQL + Prisma                       |
| אחסון    | Supabase Storage (bucket פרטי לקו"ח)      |
| מייל     | Nodemailer / Resend (+ בדיקת שבת)         |
| Auth     | JWT + roles (שלב ב)                       |

## התחלה מהירה

```bash
# התקנה (workspaces — מתקין frontend + backend יחד)
npm install

# הגדרת משתני סביבה
cp .env.example backend/.env
cp .env.example frontend/.env.local
# מלאו ערכים אמיתיים בכל קובץ

# יצירת ה-Prisma client + הרצת מיגרציות
npm run prisma:generate
npm run prisma:migrate

# הרצה (frontend על 3000, backend על 4000)
npm run dev:frontend
npm run dev:backend
```

## סקריפטים בשורש

| סקריפט                   | פעולה                         |
| ------------------------ | ----------------------------- |
| `npm run dev:frontend`   | מריץ את ה-Next.js (port 3000) |
| `npm run dev:backend`    | מריץ את ה-NestJS (port 4000)  |
| `npm run build`          | בונה את שני ה-workspaces      |
| `npm run prisma:migrate` | מיגרציה ל-DB (backend)        |
| `npm run prisma:seed`    | זריעת נתוני דמה (backend)     |

## כללים קריטיים

- כל טקסט ציבורי **בעברית בלבד**, `dir="rtl"`, פונט Heebo.
- **אסור** תמונות אנשים, באנרים צבעוניים.
- **פרסומות בתשלום** (באנרי חסות + משרות ממומנות) נתמכות — מודעות צד-ראשון מאושרות צוות, prepaid, ללא תמונות אנשים, מסומנות "מודעה".
- שם המעסיק **לעולם לא** מופיע בקומפוננטות/תגובות API ציבוריות.
- אין שליחת מיילים/התראות אוטומטיות בשבת וחג (`backend/src/common/shabbat`).
- קורות חיים — bucket פרטי, גישה רק דרך signed URLs.

ראו `.github/copilot-instructions.md` להנחיות מלאות.
