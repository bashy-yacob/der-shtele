# סקירת קוד מלאה — ממצאים ורשימת תיקונים

> ## עדכון 2026-06-24 — שלבים 1–3 לסגירת פערי האיפיון (טרם נפרס)
> בוצעו במסגרת תוכנית סגירת הפערים מול spec-v3.1. הקוד עובר `tsc`+`build`+46 טסטים (בק) ו-`build` נקי (פרונט). **טרם נפרס; טרם הורצה המיגרציה.**
> - **עמלות (COM-1..5):** ✅ enum חדש `not_due→due→invoiced→paid`; `isCommissionDue`/`effectiveCommissionStatus` מקדמים ל-due רק בתום ערבות; `assertCommissionTransition` חוסם `paid`/`invoiced` לפני תום הערבות; `calcGuaranteeEnd` עם clamp לסוף חודש.
> - **שבת/חג (SHB-1,3):** ✅ `ShabbatService` מול Hebcal API (חלונות הדלקה→הבדלה, כולל יו"ט) עם fallback להיוריסטיקה; email+mailing+תזכורות עוברים דרכו.
> - **מיילים אוטומטיים (סעיף 8.2):** ✅ עדכון סטטוס למועמד, ברכת גיוס, אימות מייל, דיוור משרה חדשה למנויים; ✅ `TasksService` (cron יומי + טריגר ידני `POST /tasks/run-daily` עם `TASKS_SECRET`): קידום עמלות ל-due + תזכורת גבייה 90 יום + דייג'סט שיחות/תזכורות לצוות.
> - **אימות מייל (3.1):** ✅ `User.emailVerified/verificationToken`; שליחה בהרשמה; `POST /auth/verify` + `/auth/me/resend-verification`; עמוד `/auth/verify` + באנר באזור האישי. Google→מאומת אוטומטית.
> - **opt-in צור-קשר (MSC-7):** ✅ `Contact.optInMarketing/optInAt` + צ'קבוקס בטופס.
> - **הסכמת מייל באדמין (7.2):** ✅ מוצגת בכרטיס המועמד.
> - **קו"ח בפרופיל + שימוש חוזר (5):** ✅ `GET/POST /candidates/me/cv`; כרטיס בפרופיל + אפשרות "השתמש בקו"ח הקיים" בטופס ההגשה.
> - **חשבונית (7.4):** ✅ מספר חשבונית דטרמיניסטי נרשם בלוג במעבר ל-invoiced; עמוד החשבונית מציג מספר+תאריך יציבים.
> - **SMTP:** ✅ EmailService מוכן ל-Resend; `docs/email-resend-setup.md`. ⏳ דורש מפתח API.
> - **מיגרציה:** `prisma/migrations/20260624120000_phase1to3_commission_verify_optin` — להריץ `migrate deploy` **אחרי** פריסת הקוד.
> - **לא נכלל (נדחה במכוון):** פורטל מעסיקים + role `employer` + `JobStatus: pending` (שלב 4).



> נוצר ב-2026-06-15 מתוך סקירת קוד על כל הפרויקט (6 סוכני סקירה מקבילים + אימות ידני).
> סטטוס: `CONFIRMED` = אומת עם trigger ברור · `PLAUSIBLE` = מנגנון אמיתי, trigger לא ודאי.
> סמן `[x]` כשממצא תוקן. אל תיגע בלוגיקת עמלות / schema / Shabbat ללא אישור מפורש (ראה CLAUDE.md).

---

## 🔴 אבטחה — עדיפות עליונה

- [x] **SEC-1 · סוד JWT עם fallback קשיח** `CONFIRMED` ✅ תוקן
  - מיקום: `backend/src/modules/auth/jwt.strategy.ts:20` + `backend/src/modules/auth/auth.module.ts:16`
  - תוקן: שני המקומות עברו ל-`config.getOrThrow('JWT_SECRET')` — נכשל באתחול אם הסוד חסר.
  - ⚠️ פעולה נדרשת: לוודא ש-`JWT_SECRET` מוגדר ב-`.env` (dev) וב-Render (prod), אחרת השרת לא יעלה.

- [x] **SEC-2 · סיסמת אדמין חלשה וקשיחה ב-seed על DB משותף חי** `CONFIRMED` ✅ תוקן
  - מיקום: `backend/prisma/seed.ts`
  - תוקן: הסיסמה נקראת מ-`SEED_ADMIN_PASSWORD` (חובה, ≥8 תווים), ה-plaintext הוסר מה-log.
  - ⚠️ פעולה נדרשת: האדמין הקיים ב-DB עדיין עם `admin1234` (upsert לא דורס) — להחליף ידנית. ולהגדיר `SEED_ADMIN_PASSWORD` לפני seed הבא.

- [x] **SEC-3 · דליפת הודעות שגיאה פנימיות ללקוח** `CONFIRMED` ✅ תוקן
  - מיקום: `backend/src/common/filters/http-exception.filter.ts:37-42`
  - תוקן: שגיאות לא-HTTP מתועדות רק בלוג השרת; ללקוח חוזר `'שגיאת שרת'` גנרי.

- [x] **SEC-4 · גולש אנונימי יכול לשלוח מועמדות/קו"ח + XSS במייל לצוות** `CONFIRMED` ✅ תוקן
  - ✅ XSS: `escapeHtml` מוחל על כל קלט משתמש בגוף המיילים לצוות.
  - ✅ `@Public()` הוסר מ-`POST /candidates` ו-`POST /candidates/resume` → מחייב התחברות. ה-proxies מעבירים את ה-Authorization, וטופס ההגשה מצרף את הטוקן (יחד עם FRM-4).

- [x] **SEC-5 · העלאת קבצים: אין תקרת גודל ב-multer + MIME מזויף + שגיאות 500** `CONFIRMED` ✅ תוקן
  - מיקום: `backend/src/modules/{contact,candidates}/*.controller.ts`, `backend/src/common/storage/storage.service.ts`
  - תוקן: נוצר `resume-upload.options.ts` (limits.fileSize=5MB + fileFilter לפי MIME) ומוחל על שני ה-`FileInterceptor`; ולידציה בשרת עברה ל-`BadRequestException` (400); סיומת הקובץ עוברת sanitize.
  - הערה: בדיקת magic-bytes (תוכן אמיתי מול MIME) נותרה כשיפור עתידי (דורש ספרייה כמו `file-type`).

### אבטחה — רמה בינונית
- [ ] **SEC-6 · טוקן ב-`localStorage` חשוף ל-XSS** — `frontend/src/hooks/useAuth.ts:22` · שקול cookie HttpOnly. `PLAUSIBLE`
- [ ] **SEC-7 · user-enumeration ע"י תזמון ב-login** — `backend/src/modules/auth/auth.service.ts:44` · להריץ bcrypt dummy גם כשאין משתמש. `CONFIRMED`
- [ ] **SEC-8 · `RolesGuard` לא גלובלי** — `backend/src/app.module.ts:36` · היום מכוסה ידנית בכל controller, אבל כדאי `APP_GUARD` כדי שאי אפשר לשכוח. `PLAUSIBLE`
- [ ] **SEC-9 · CORS עם origin יחיד + fallback ל-localhost** — `backend/src/main.ts:13` · לחייב env בפרוד / allowlist. `PLAUSIBLE`
- [ ] **SEC-10 · bcrypt 10 סבבים + bcryptjs** — `backend/src/modules/auth/auth.service.ts:28` · לשקול 12 / native bcrypt / argon2. `PLAUSIBLE`

---

## 🟠 חוק עסקי קריטי — לוגיקת העמלות (⚠️ דורש אישור מפורש לפני שינוי)

> כל כלל "העמלה הופכת `due` רק אחרי 3 חודשי ערבות, לעולם לא ביום הגיוס" אינו ממומש בפועל. סומן ע"י 3 סוכנים עצמאית.

- [ ] **COM-1 · ה-enum חסר `not_due`/`due`** `CONFIRMED`
  - מיקום: `backend/prisma/schema.prisma:72-77` (וגם `frontend/src/types/index.ts:54-58`)
  - בעיה: ה-enum הוא `pending/invoiced/paid/partial_refund` — אי אפשר לייצג את המצב במודל. דורש migration.

- [ ] **COM-2 · `isCommissionDue()` מסמן due ביום הגיוס** `CONFIRMED`
  - מיקום: `backend/src/common/commission/commission.ts:28-37`
  - בעיה: מחזיר true ברגע `confirmed`, בלי לבדוק `guaranteeEndsAt`.
  - תיקון: לקבע על `isGuaranteeOver(guaranteeEndsAt)` (או `status === 'completed'`).

- [ ] **COM-3 · `deriveCommissionStatus()` אף פעם לא מקדם ל-due** `PLAUSIBLE`
  - מיקום: `backend/src/common/commission/commission.ts:44-54`
  - בעיה: מחזיר `current` לכל מעבר שאינו ביטול; המעבר ל-due לא קיים בשום מקום.

- [ ] **COM-4 · `updateStatus` כותב כל סטטוס ללא שומר מעברים** `CONFIRMED`
  - מיקום: `backend/src/modules/commissions/commissions.service.ts:44-54`
  - בעיה: אדמין יכול לסמן `paid` באמצע הערבות. תיקון: `assertCommissionTransition` + חסימת `paid` כל עוד `!isGuaranteeOver`.

- [ ] **COM-5 · חישוב 3 החודשים עלול לגלוש** `PLAUSIBLE`
  - מיקום: `backend/src/common/commission/commission.ts:10-14`
  - בעיה: `setMonth(+3)` על 30/11 → 02/03 (off-by-1-2 ימים). תיקון: clamp לסוף חודש / ספריית תאריכים.

---

## 🟠 אי-התאמה לאיפיון v3.1 — מגדר + אישור רבני (⚠️ schema → אישור)

> סומן ע"י 3 סוכנים. הסרה רוחבית מתואמת DB → backend → frontend.

> ✅ **V31 בוצע במלואו (2026-06-16).** הוסר מגדר + אישור רבני מכל השכבות. `tsc` + `build` נקיים בשני הצדדים, אפס התייחסויות `gender`/`rabbinical` נותרו ב-src. ⚠️ ה-migration נוצר אך **טרם הוחל** על ה-DB — ראה רצף הפריסה למטה.

- [x] **V31-1 · DB: עמודות `gender`/`rabbinicalApproval`/`By`** ✅ הוסרו מ-`schema.prisma`; migration `20260616120000_remove_gender_and_rabbinical` נוצר (DROP COLUMN ×4 + DROP TYPE "Gender"); seed נוקה.
- [x] **V31-2 · Backend: `PUBLIC_SELECT` + `findPublic` filter** ✅ הוסרו; וגם `QueryJobsDto`, `CreateJobDto`, `CreateCandidateDto`, `candidates.service`.
- [x] **V31-3 · Frontend: דרופדאון סינון מגדרי** ✅ הוסר מ-`jobs/page.tsx` (+ הוסר בלוק קוד מת מוער) ו-`JobFilters.tsx`.
- [x] **V31-4 · Frontend: תגית מגדר** ✅ הוסרה מ-`JobCard.tsx` ו-`jobs/[id]/page.tsx`.
- [x] **V31-5 · Frontend: באדג' "✓ אישור רבני"** ✅ הוסר משני המקומות.
- [x] **V31-6 · `api.ts` + `mockData.ts`** ✅ `RawPublicJob`/`toPublicJob`/`JobsFilter`/`getPublicJobs` נוקו; `GENDER_LABELS` + `Gender` type הוסרו; `mockData.ts` **נמחק** (היה dead code).

**רצף פריסה ל-V31 (חובה לפי הסדר — DB משותף עם prod):**
1. push קוד (frontend+backend ללא gender) → Render+Vercel מפרסמים. הבאדג' נעלם מהאתר מיד; ה-API מפסיק להחזיר gender.
2. **רק אחרי** שה-deploy הסתיים: `npx prisma migrate deploy` (או הרצת ה-SQL ב-Supabase) — מוחק את העמודות.
3. בין 1 ל-2: קריאות עובדות; יצירת משרה/מועמד חדשים תיכשל זמנית (העמודה עדיין NOT NULL ב-DB) — לכן להחיל את ה-migration סמוך לפריסה.

---

## 🟡 זרימת אישור משרות

- [ ] **JOB-1 · כל משרה עולה לאתר מיד — אין שלב אישור צוות** `CONFIRMED`
  - מיקום: `backend/src/modules/jobs/jobs.service.ts:69-71` + `backend/prisma/schema.prisma:167`
  - בעיה: `JobStatus` = `active/paused/closed/filled`, ברירת מחדל `active`, create לא קובע סטטוס.
  - תיקון: מצב `pending`/`draft`, הציבורי מסנן רק `approved`, מעבר state-machine `pending → active`. דורש schema.

---

## 🟡 שבת/חג (⚠️ Shabbat detection קריטי עסקית — אישור)

- [ ] **SHB-1 · זיהוי שבת מבוסס טבלת שעות קשיחה, מתעלם מחגים, סחף DST** `CONFIRMED`
  - מיקום: `backend/src/common/shabbat/shabbat.ts:13-42`
  - בעיה: מיילים יכולים להישלח ביו"ט שחל באמצע השבוע או סמוך לכניסת שבת. תיקון: לחבר Hebcal API (מתוכנן ב-TODO).
- [ ] **SHB-2 · `nextAllowedSendTime` עלול להחזיר זמן בתוך שבת** `PLAUSIBLE` — `backend/src/common/shabbat/shabbat.ts:55-59`
- [ ] **SHB-3 · תזכורות ללא שומר שבת** `CONFIRMED` — `backend/src/modules/reminders/reminders.service.ts:26-36` · לנתב דרך `nextAllowedSendTime`/`EmailService.send`.
- [ ] **SHB-4 · מייל נדחה ב-send() מושמט ולא נשמר בתור** `CONFIRMED` — `backend/src/modules/email/email.service.ts:52-60` · לתור (DB/Bull).

---

## 🟡 טפסים וזרימת הגשה

- [x] **FRM-1 · באג הטלפון: regex דוחה placeholder עם מקפים** `CONFIRMED` ✅ תוקן
  - תוקן: נוצר `phoneSchema` משותף ב-`frontend/src/lib/validations.ts` שמנרמל (מסיר תווים שאינם ספרות) ואז מאמת `^05\d{8}$`. מוחל בשני הטפסים. ה-DTOs בבק (`create-contact`, `create-candidate`) קיבלו `@Transform` שמנרמל לפני `@Matches`. נבדק עם 7 מקרים (כולל `050-0000000` → עובר).
- [x] **FRM-2 · 3 regex טלפון שונים + `validations.ts` לא מיובא** `CONFIRMED` ✅ תוקן (לטלפון)
  - תוקן: כל הטפסים מייבאים עכשיו את `phoneSchema` מ-`validations.ts` (regex אחד). שאר הסכמות עדיין inline בכל טופס — מיגרציה מלאה של *כל* הסכמות ל-`validations.ts` נותרה כניקוי אופציונלי קטן.
- [x] **FRM-3 · טופס ההגשה אין בו העלאת קו"ח (שולח JSON)** `CONFIRMED` ✅ תוקן
  - תוקן: נוסף שדה קו"ח חובה (PDF/Word ≤5MB, ולידציית Zod) ל-`ApplicationForm`. ההגשה דו-שלבית: מעלה את הקובץ ל-proxy חדש `frontend/src/app/api/candidates/resume/route.ts` → מקבל `path` → שולח את ההגשה עם `cvPath`. (ה-blocker של `gender` כבר הוסר ב-V31.)
- [x] **FRM-4 · דף apply לא חוסם לפי auth** `CONFIRMED` ✅ תוקן
  - `ApplicationForm` חוסם לפי auth: גולש לא-מחובר רואה הזמנה להתחבר/להירשם (Link ל-`/login?redirect=...`) במקום הטופס; מחובר → הטופס מצרף טוקן בשתי הקריאות. login מכבד `?redirect` (נתיב יחסי בטוח בלבד).
- [x] **FRM-5 · opt-out בהגדרות לא עובד (checkbox קשיח, אין handler)** `CONFIRMED` ✅ תוקן
  - תוקן: נוסף `PATCH /api/auth/me` בבק (+ `GET /me` מחזיר עכשיו `optInMarketing` עדכני מה-DB); עמוד ההגדרות טוען את הערך האמיתי ושומר דרך `updateMarketing` ב-`useAuth`. opt-in חדש חותם `optInAt` (חוק הספאם).

### 🔧 תיקון NetFree (auth proxy) — לא ממוספר אך קריטי
- [x] **קריאות auth דרך proxy server-side** ✅ נפרס ואומת חי
  - היה: `useAuth` קרא לבק ישירות מהדפדפן (`NEXT_PUBLIC_API_URL`) → נחסם ע"י NetFree. עכשיו: proxy routes `/api/auth/{login,register,me}` (same-origin) + `useAuth` קורא דרכם. אומת על ה-prod (login proxy מחזיר את שגיאת ה-auth מהבק).
- [x] **FRM-6 · `useAuth` ללא בדיקת `res.ok`, `fullName` קשיח `''`** `CONFIRMED` ✅ תוקן
  - תוקן: נוסף `res.ok` guard לפני `json()`; `fullName` נוסף ל-JWT payload (`jwt.strategy`+`auth.service`+`AuthUser`) כך ש-`/me` מחזיר אותו, וה-frontend ממפה `res.data.fullName`.
- [x] **FRM-7 · `MOCK_JOBS` עדיין מחובר כ-fallback ב-apply** `CONFIRMED` ✅ תוקן
  - תוקן: הוסר ה-import וה-fallback; דף apply מציג מצב "לא נמצא / נסו שוב" כשהמשרה לא נטענה, במקום טופס למשרה פיקטיבית.

---

## 🟢 הקשחת מודל נתונים (⚠️ schema — אישור)

- [ ] **DAT-1 · `cvUrl` שומר URL ולא path** `CONFIRMED` — `backend/prisma/schema.prisma:194` · לשנות ל-`cvPath` כמו `Contact.resumePath`.
- [ ] **DAT-2 · אין `@unique` על `Candidate.email`; אין אינדקסים על `field`/`region`/`status`** `CONFIRMED` — `backend/prisma/schema.prisma:188, 159-167`
- [ ] **DAT-3 · `reminders.jobId` FK תלוי-אוויר בלי relation/constraint** `CONFIRMED` — `backend/prisma/schema.prisma:284`
- [ ] **DAT-4 · `opt_in_at` רק על `User` ו-nullable; ל-`Candidate` אין שדה הסכמה** `CONFIRMED` — `backend/prisma/schema.prisma:98, 184-210`
- [ ] **DAT-5 · כל ה-FK `RESTRICT` כברירת מחדל שקטה** `CONFIRMED` — להחליט מפורשות Cascade/Restrict לכל relation.

---

## 🟢 שונות (correctness)

- [ ] **MSC-1 · `applications.update` ללא שומר state-machine** `CONFIRMED` — `backend/src/modules/applications/applications.service.ts:50-53`
- [ ] **MSC-2 · בליעה שקטה של `jobId` שגוי בהגשת מועמד** `PLAUSIBLE` — `backend/src/modules/candidates/candidates.service.ts:35-39`
- [ ] **MSC-3 · over-posting של `employerId` דרך `...dto`** `PLAUSIBLE` (ממותן ע"י ValidationPipe) — `backend/src/modules/jobs/jobs.service.ts:78-87`
- [ ] **MSC-4 · אין pagination ב-findPublic/findAll** `CONFIRMED` — `backend/src/modules/jobs/jobs.service.ts:28-39` ועוד.
- [ ] **MSC-5 · מחיקת תזכורת ללא בדיקת בעלות** `PLAUSIBLE` — `backend/src/modules/reminders/reminders.controller.ts:44-47`
- [ ] **MSC-6 · `contactEmail` ללא `@IsEmail`** `PLAUSIBLE` — `backend/src/modules/employers/dto/create-employer.dto.ts:22`, `backend/src/modules/contact/dto/create-contact.dto.ts`
- [ ] **MSC-7 · טופס צור-קשר אוסף שם/טלפון בלי opt-in/opt_in_at** `PLAUSIBLE` — חוק הספאם.
- [ ] **MSC-8 · `applications.findAll` מחזיר `phone` של מועמד** `PLAUSIBLE` — `backend/src/modules/applications/applications.service.ts:16-24` · מסוכן אם ייעשה בו שימוש חוזר ל-portal מעסיקים. להסיר `phone` מה-select.
- [ ] **MSC-9 · מחרוזת לא מתורגמת "הזדמנויות for פיתוח מקצועי"** — `frontend/src/app/jobs/[id]/page.tsx:75`

---

## ✅ מה שנבדק ותקין (לא לבזבז זמן)
- RTL מלא ונכון (`frontend/src/app/layout.tsx:22`), לוגיקת start/end ולא left/right.
- **אין תמונות אנשים** בשום מקום (אפס `<img>`/`next/image`/`bg-[url]`).
- אין `dangerouslySetInnerHTML` בשום מקום.
- צ'קבוקס opt-in בהרשמה — חובה ותקין (`frontend/src/components/forms/RegisterForm.tsx:17`).
- `PUBLIC_SELECT` לא מדליף פרטי חברה/מעסיק (`descriptionInternal`/`employer` מוחרגים).
- `ValidationPipe` עם `whitelist + forbidNonWhitelisted + transform`.
- אין drift בין `schema.prisma` למיגרציות (אי-ההתאמה היא schema-מול-spec בלבד).

---

## סדר עדיפויות מומלץ
1. **SEC-1, SEC-3** — תיקון נקי בלי schema ובלי לוגיקה עסקית. להתחיל כאן.
2. שאר **אבטחה** (SEC-2, SEC-4, SEC-5).
3. **COM-1..5** (לוגיקת העמלות) — דורש אישור.
4. **V31-1..6** (הסרת מגדר/רבני) — ניקוי רוחבי, דורש אישור schema.
5. השאר לפי קצב.
