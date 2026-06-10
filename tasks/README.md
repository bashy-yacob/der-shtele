# דער שטעלע — מפת משימות

## סטטוס כללי

| שלב | תוכן | סטטוס |
|-----|------|--------|
| [שלב א](./phase-a.md) | אתר ציבורי — לוח משרות + טופס הגשה | 🔨 בפיתוח |
| [שלב ב](./phase-b.md) | CRM פנימי — מועמדים, משרות, מעסיקים | ⏳ לא התחיל |
| [שלב ג](./phase-c.md) | לוח בקרה, עמלות, תזכורות | ⏳ לא התחיל |
| [אופקי](./ongoing.md) | אבטחה, ביצועים, נגישות | 🔄 שוטף |

---

## מה כבר מוכן (בסיס)

### קבצי תשתית ✅
- `src/types/index.ts` — כל הטיפוסים לשלבים א+ב+ג
- `prisma/schema.prisma` — מודל DB מלא לכל השלבים
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/constants.ts` — תוויות עברית, פרטי קשר
- `src/lib/validations.ts` — Zod schema לטופס הגשה
- `src/lib/statusMachine.ts` — מעברי סטטוס חוקיים (מועמד / משרה / גיוס)
- `src/lib/shabbat.ts` — בדיקת שבת לפני שליחת מיילים
- `src/lib/auth.ts` — skeleton לאימות CRM
- `src/lib/mockData.ts` — נתוני דמה לפיתוח

### קבצי הגדרות AI ✅
- `.github/copilot-instructions.md` — הנחיות כלליות לפרויקט
- `.github/instructions/typescript.instructions.md`
- `.github/instructions/components.instructions.md`
- `.github/instructions/api-routes.instructions.md`
- `.github/instructions/crm.instructions.md`

### אתר ציבורי — בסיס ✅
- `src/app/page.tsx` — דף בית
- `src/app/jobs/page.tsx` — לוח משרות (mock data)
- `src/app/jobs/[id]/page.tsx` — דף משרה
- `src/app/contact/page.tsx` — טופס הגשה (ללא שמירה ל-DB עדיין)
- `src/app/about/page.tsx` — דף אודות
- `src/app/api/candidates/route.ts` — API (ללא DB עדיין)
- `src/app/api/jobs/route.ts` — API (mock data)
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/jobs/JobCard.tsx`

---

## הצעד הבא המיידי

**שלב א — לחבר DB אמיתי:**

```bash
# 1. להתקין תלויות
npm install

# 2. להגדיר .env.local (לפי .env.example)

# 3. להריץ migration ראשוני
npx prisma migrate dev --name init

# 4. לפתוח Prisma Studio לבדיקה
npx prisma studio
```

לאחר מכן — להחליף את `mockData` ב-`db.job.findMany()` ב-`src/app/jobs/page.tsx`.
