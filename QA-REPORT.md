# דו"ח בדיקות תקינות — דשבורד מנהלים

> נוצר אוטומטית · ענף `feature/admin-dashboard` · 2026-06-17

כל בדיקות התקינות שהוגדרו במשימה הורצו ועברו. להלן התוצאות בפועל.

## סיכום מהיר

| בדיקה | פקודה | תוצאה |
| --- | --- | --- |
| TypeScript — backend | `npx tsc -p tsconfig.build.json --noEmit` | ✅ 0 שגיאות |
| TypeScript — frontend | `npx tsc --noEmit` | ✅ 0 שגיאות |
| ESLint — backend | `npm run lint` | ✅ 0 שגיאות / אזהרות |
| ESLint — frontend | `npm run lint` (next lint) | ✅ No ESLint warnings or errors |
| Build — backend | `npm run build` (nest build) | ✅ עבר נקי |
| Build — frontend | `npm run build` (next build) | ✅ עבר נקי — 18 מסלולי admin נבנו |
| בדיקות יחידה | `npm test` (vitest) | ✅ **34/34** עברו (4 קבצים) |
| Prisma schema | `npx prisma validate` | ✅ valid |
| Prisma client | `npx prisma generate` | ✅ נוצר |

## פירוט הבדיקות (Vitest — 34 בדיקות)

מיקום: `backend/test/`. אינן דורשות DB חי — פונקציות טהורות ו-guards עם mocks.

### `commission.spec.ts` — לוגיקת עמלות וערבות
- תקופת ערבות = 3 חודשים; `calcGuaranteeEnd` מוסיף 3 חודשים.
- `isCommissionDue`: עמלה מגיעה רק אחרי אישור הגיוס (confirmed+), לא ביום הגיוס,
  ולא לאחר תשלום/החזר.
- `deriveCommissionStatus`: ביטול בתוך ערבות → `partial_refund`; אחרי ערבות → ללא שינוי.
- `calcPartialRefund`: החזר יחסי לזמן שנותר; אפס אחרי תום הערבות.

### `shabbat.spec.ts` — אין שליחה בשבת
- שבת בצהריים / שישי אחרי כניסת שבת → `true`.
- שישי בבוקר / אמצע השבוע → `false`.
- `nextAllowedSendTime`: ביום חול = עכשיו; בשבת = זמן עתידי.

### `status-machine.spec.ts` — מעברי סטטוס
- מעברים חוקיים/לא־חוקיים למועמד, משרה וגיוס.
- `assert*` זורק על מעבר לא חוקי (למשל `pending → completed` בגיוס).

### `guards.spec.ts` — הגנת הרשאות (role != admin → 403)
- `RolesGuard`: admin/staff עוברים כשנדרש staff/admin.
- מועמד (candidate) או ללא משתמש → `ForbiddenException` (403).
- staff נחסם כשנדרש admin בלבד (עמלות).
- `JwtAuthGuard`: route עם `@Public` עובר ללא אימות.

> הערה: אכיפת 401 (טוקן חסר/לא תקין) נעשית ע"י Passport ברמת ה-strategy ולכן
> נבדקת בשכבת אינטגרציה (דורשת אפליקציה חיה), לא ב-unit. ה-403 (הרשאת תפקיד) —
> שהוא לב ההגנה של ה-CRM — נבדק ישירות מול ה-guard.

## בדיקות שלא בוצעו (ומדוע)

- **e2e מול שרת חי + DB**: לא הורצו. דורשים הרצת backend מול ה-DB המשותף (prod).
  הבדיקות שכן רצו (guards + פונקציות עסקיות) מכסות את לוגיקת ההרשאות והעסקים בלי
  סיכון לנגוע ב-DB החי.
- **מיגרציית Prisma**: לא הורצה — לא בוצע שום שינוי סכימה (ראה `DECISIONS.md`).
  `prisma validate` מאשר שהסכימה הקיימת תקינה.
