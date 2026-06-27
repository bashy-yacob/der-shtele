# דער שטעלע — הוראות פרויקט

## מהו הפרויקט

סוכנות השמה דיגיטלית לציבור החרדי בישראל. **לא** פלטפורמה ישירה — כל קשר בין
מועמד למעסיק עובר דרך הצוות בלבד. זה המנגנון שמבטיח שלא ניתן לעקוף את הסוכנות.

רכיבים: אתר ציבורי + פורטל מעסיקים + דשבורד מנהלים. צוות פנימי של 2 נציגים.

## מצב נוכחי (עודכן 2026-06-24)

- **כל 4 שלבי האיפיון בנויים, פרוסים וחיים** ✅ — אתר ציבורי, אזור מועמד, דשבורד מנהלים (CRM), ופורטל מעסיקים. נבדק end-to-end על ה-live.
- **Frontend↔Backend מחוברים:** הפרונט נקרא מהבק דרך proxy routes ב-`frontend/src/app/api/*` (same-origin, לא נחסם ע"י NetFree; לא ניגש ל-DB ישירות). גם auth (login/register/me/verify) ופורטל (`/api/portal/*`) עוברים דרך proxy.
- **הרצה:** `npm run dev` משורש הריפו מריץ את שניהם (בק `:4000` prefix `/api`, פרונט `:3000`). `/` ו-`/health` מחוץ ל-prefix (Render cold-start).
- **DB:** Supabase משותף (ref `osgwcjjbgnkivdrvavlb`) **לפיתוח ולפרודקשן יחד** — אין Postgres מקומי. מיגרציות **לא רצות אוטומטית** — להריץ `npx prisma migrate deploy` (הבק "לפני" ה-DB עד שזה רץ; לפרוס קוד ואז מיד migrate). אחרונה שהוחלה: `20260624140000`. ⚠️ סיסמת admin עדיין `admin1234`, ומשתמש פורטל דמו `employer@dershtele.co.il` / `DerShtele!2026` — **חלשות בכוונה עד סוף הפיתוח**, להחליף לפני שימוש אמיתי.
- **פריסה (live):** פרונט Vercel (`der-shtele.vercel.app`), בק Render free (`der-shtele-backend.onrender.com`), DB+אחסון Supabase. `render.yaml` בשורש; push ל-main → deploy אוטומטי בשניהם.
- **שלב 4 — פורטל מעסיקים:** role `employer` משויך ל-Employer (`User.employerId`); כניסה נפרדת `/portal/login`; פרסום משרה → `pending` → אישור הצוות (`pending→active` ב-StatusCard) → עולה לאתר; המעסיק רואה מועמדים שהוצגו בשם מקוצר + סטטוס בלבד (**ללא פרטי קשר** — מודל התיווך). יצירת משתמש פורטל מהאדמין (`POST /employers/:id/portal-user`).
- **הרשמת מעסיק עצמית (בקשת גישה):** מעסיק נרשם לבד ב-`/portal/register` (`POST /auth/employer-register`) → נוצר Employer בסטטוס `pending` + משתמש פורטל; מתחבר מיד אך רואה רק מסך "ממתין לאישור". `Employer.status` = `pending→approved→rejected`; הצוות מאשר/דוחה בדשבורד המעסיקים (`PATCH /employers/:id/approve|reject`, +מייל למעסיק). גולש לא-מחובר שמנסה `/portal/*` מופנה לנחיתה `/employers`. שער שרת: `requireApprovedEmployer` חוסם פרסום/צפייה במועמדים עד אישור. מעסיק שהצוות יוצר ידנית = `approved` אוטומטית (default בסכימה).
- **עמלות:** מודל `not_due→due→invoiced→paid` נאכף בבק — `due` רק בתום 3 חודשי ערבות; `assertCommissionTransition` חוסם `paid`/`invoiced` מוקדם. קרון יומי מקדם ל-`due` + יוצר תזכורת גבייה.
- **שבת/חג:** `ShabbatService` מול **Hebcal API** (חלונות הדלקה→הבדלה כולל יו"ט) + fallback היוריסטי. email/mailing/תזכורות עוברים דרכו.
- **מיילים:** נבנו אישור הרשמה/הגשה, אימות כתובת (`/auth/verify`), עדכון סטטוס, ברכת גיוס, דיוור משרה חדשה, דייג'סט צוות. `TasksService` cron יומי + `POST /tasks/run-daily` (header `TASKS_SECRET`, מופעל ע"י cron חיצוני כי Render free נרדם). ⚠️ **SMTP/Resend לא מוגדר עדיין** (אין דומיין) → כל המיילים רק נכתבים ללוג (fail-soft). **זה הפער התפקודי היחיד שנותר.**
- **ציות:** opt-in חובה בהרשמה + opt-out פעיל (`PATCH /api/auth/me`); opt-in בצור-קשר; הסכמת מייל מוצגת בכרטיס המועמד; קו"ח בפרופיל + "השתמש בקו"ח הקיים".
- **אבטחה (הוקשח):** `JWT_SECRET` חובה (getOrThrow); שגיאות פנימיות לא דולפות; `escapeHtml` בקלט; קו"ח עם limit+fileFilter; login עם קיזוז תזמון (SEC-7); bcrypt 12 (SEC-10); CORS allowlist (SEC-9); הגשת מועמדות מחייבת auth (SEC-4 בוצע); JSON-LD escaped.
- **אחסון קו"ח:** bucket `resumes` ב-Supabase. ⚠️ קיים fallback מקומי **dev-only** ב-`StorageService`.
- **תאימות v3.1:** ✅ סינון מגדרי ו-`rabbinicalApproval` הוסרו לחלוטין מכל השכבות (כולל migration).
- **Pending יחיד:** SMTP/Resend (ממתין לדומיין אישי). מעקב ממצאי סקירת קוד מלא: `docs/code-review-findings.md`.

## סטאק טכנולוגי

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS. גופן Heebo. טפסים עם React Hook Form + Zod.
- **Backend:** NestJS + Node.js
- **DB:** PostgreSQL + Prisma ORM
- **אחסון קבצים:** Supabase Storage (bucket פרטי לקו"ח)
- **Auth:** JWT + role-based (Admin / Employer / Candidate)
- **Email:** Resend / Nodemailer
- **Hosting:** Vercel (frontend) + Render free (backend). _(Railway שצוין במקור כבר לא חינמי — הוחלף ב-Render.)_
- **לוח שנה יהודי:** Hebcal API
- **מבנה:** monorepo עם `frontend/` ו-`backend/`

## פקודות

> לאמת מול הסקריפטים האמיתיים ב-`package.json` ולתקן אם שונה.

Frontend (`frontend/`): `npm run dev` · `npm run build` · `npm run lint`
Backend (`backend/`): `npm run start:dev` · `npm run build` · `npm run test` · `npm run lint`
Prisma (backend): `npx prisma migrate dev` · `npx prisma generate` · `npx prisma studio`

## כללי ברזל תרבותיים — חובה, לא לעבור עליהם

- כל הממשק בעברית, **RTL מלא**.
- **ללא תמונות של אנשים** בשום חלק באתר (כולל Hero, אווטרים, רקעים).
- עיצוב צנוע ושמרני. ללא פרסומות. ללא אנימציות פולשניות.
- ניסוח **מכובד**, גוף שני יחיד, ישיר — לא פורמלי-יתר.
- ניסוח כפול (מועמד/ת, מחפש/ת) כשנחוץ.
- **אסור** למסגר עבודה כמשנית ללימוד תורה — זה פוגעני. ניסוח ישיר ומכבד.
- **אין סינון מגדרי** (הוסר בגרסה 3.1). כל המשרות גלויות לכל המועמדים.
- **אין אישור רבני** (הוסר בגרסה 3.1).
- **אין שליחת מיילים/SMS בשבת ויו"ט** — בדיקה מול Hebcal API לפני כל שליחה.

## חוקי עסק קריטיים

- **עמלה:** סטטוס `not_due → due → paid`. הופכת ל-`due` **רק** אחרי 3 חודשי ערבות
  מוצלחים. לעולם לא לגבות ביום הגיוס. לאכוף ברמת מודל הנתונים (`isCommissionDue()`,
  `deriveCommissionStatus()`).
- מעסיק **לא** רואה פרטי קשר של מועמד — הכל מגיע דרך הצוות.
- פרטי חברה מוסתרים מהציבור — נמסרים רק אחרי סינון ואישור הצוות.
- גולש לא רשום: **צפייה במשרות בלבד**. שליחת קו"ח מחייבת הרשמה.
- מעסיק מפרסם → הצוות מאשר → רק אז המשרה עולה לאתר.
- משרה שנסגרה ושמורה אצל מועמד: מסומנת "לא פעילה", **לא נמחקת**.

## ציות משפטי (חוק הספאם הישראלי)

- Opt-in למיילים הוא **חובה** בהרשמה (צ'קבוקס חובה — בלי סימון אין הרשמה).
- לשמור `opt_in_at` (תאריך + שעה של ההסכמה) בטבלת המשתמשים.
- Opt-out זמין תמיד מהאזור האישי.
- ייצוא רשימת תפוצה מחייב הסכמה תקפה.

## אבטחה ואחסון קבצים

- קו"ח: Supabase Storage, **bucket פרטי**. בצד שרת להשתמש ב-`SUPABASE_SERVICE_ROLE_KEY`
  (לא anon key).
- לשמור **path** ב-Prisma, לא URL מלא.
- לעולם לא לשמור קבצים ב-filesystem מקומי — סביבות הפריסה (Vercel) הן ephemeral.

## קונבנציות קוד

- TypeScript בכל מקום. ולידציה עם Zod בגבולות (טפסים + API).
- אינדנטציה: 2 רווחים.
- Tailwind בלבד לעיצוב; לשמור על תאימות RTL (`dir="rtl"`, לוגיקת start/end ולא left/right).
- שמות קבצים ורכיבים באנגלית; תוכן מוצג (copy) בעברית.

## אל תיגע ללא אישור מפורש

- `.env` וכל קובץ סודות.
- `schema.prisma` ו-migrations — לשאול לפני שינוי סכימה.
- לוגיקת העמלות וה-Shabbat detection — קריטי עסקית, לאשר שינוי.

## לפני כל פיתוח או שיפור פיצר תקרא עליו באיפיון שנמצא בתקיית docs/spec-v3.1.md
