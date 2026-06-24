# הגדרת מיילים — Resend (SMTP)

> שלב 1.3 בתוכנית סגירת הפערים. הקוד (`backend/src/modules/email/email.service.ts`)
> כבר תומך ב-Resend; חסרה רק הזנת מפתח ה-API והגדרת הדומיין.

## רקע

`EmailService` הוא **fail-soft**: כל עוד `SMTP_PASS` ריק — מיילים רק נכתבים ללוג
ולא נשלחים (כך הפיתוח לא נתקע). ברגע שמגדירים `SMTP_PASS`, כל המיילים הקיימים
מתחילים לצאת אוטומטית — אישור הרשמה/הגשה, התראות לצוות, דיוור מהדשבורד, וכן
המיילים האוטומטיים החדשים (עדכון סטטוס, תזכורות).

כל שליחה עוברת דרך `ShabbatService` (Hebcal) — לעולם לא נשלח בשבת/יו"ט.

## משתני סביבה (backend `.env` + Render)

```dotenv
# ── Resend over SMTP ──────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend                 # קבוע — שם המשתמש ל-Resend הוא תמיד 'resend'
SMTP_PASS=re_xxxxxxxxxxxxxxxxx    # ← מפתח ה-API מ-resend.com/api-keys (סוד!)

# כתובת השולח — חייבת להיות מאומתת ב-Resend (ראה למטה)
MAIL_FROM=noreply@dershtele.co.il
MAIL_FROM_NAME=דער שטעלע

# יעד ההתראות הפנימיות לצוות
TEAM_EMAIL=dershtele@gmail.com

# בסיס לקישורי מייל (אימות כתובת וכו') — דומיין הפרונט
APP_URL=https://der-shtele.vercel.app
```

## צעדים חד-פעמיים

1. נרשמים ב-[resend.com](https://resend.com) ויוצרים **API Key** → מכניסים ל-`SMTP_PASS`.
2. **אימות דומיין** (`dershtele.co.il`) ב-Resend: מוסיפים את רשומות ה-DNS
   (SPF/DKIM) שהם נותנים. עד שהדומיין מאומת — אפשר לבדוק עם
   `MAIL_FROM=onboarding@resend.dev` (שולח רק לכתובת שבה נרשמתם).
3. מגדירים את כל המשתנים גם ב-**Render** (Environment) — לא רק ב-`.env` המקומי.
4. בדיקה מקומית: `npm run mail:test` (ב-`backend/`).

## הערה — תור שבת

מייל ש"נופל" על שבת/חג כרגע **מדולג** (לא נשלח, רק לוג). מימוש תור אמיתי
(DB/Bull) שישלח אוטומטית במוצ"ש — מתוכנן כשיפור עתידי (`email.service.ts`, TODO).
