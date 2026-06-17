# התחברות עם Google — הגדרה והפעלה

מסמך הפעלה לפיצ'ר "התחברות עם Google". הקוד כבר במקום; נותר להגדיר את ה-OAuth
Client ב-Google ולמלא משתני סביבה. בלי ההגדרות האלה האתר ימשיך לעבוד רגיל
(אימייל+סיסמה), והכפתור פשוט יחזיר שגיאה.

## 1. יצירת OAuth Client ב-Google Cloud Console

1. https://console.cloud.google.com → צור/בחר פרויקט.
2. **APIs & Services → OAuth consent screen**: סוג **External**, מלא שם אפליקציה
   ("דער שטעלע"), אימייל תמיכה, דומיין. Scopes: `openid`, `email`, `profile`.
   (אפשר להשאיר במצב "Testing" ולהוסיף משתמשי בדיקה, או לפרסם ל-Production.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs** — להוסיף **בדיוק** (בלי `/` בסוף):
     - פיתוח: `http://localhost:3000/api/auth/google/callback`
     - פרודקשן: `https://der-shtele.vercel.app/api/auth/google/callback`
4. שמור את **Client ID** ואת **Client secret**.

> ⚠️ ה-redirect URI חייב להיות **זהה בייט-לבייט** בין Google Console, משתני הסביבה,
> ומה שהפרונט בונה. זו הסיבה הנפוצה ביותר לכשל (`redirect_uri_mismatch`).

## 2. משתני סביבה

### Backend (Render + `.env` מקומי)
```
GOOGLE_CLIENT_ID=<client id>
GOOGLE_CLIENT_SECRET=<client secret>
GOOGLE_CALLBACK_URL=https://der-shtele.vercel.app/api/auth/google/callback
```
בפיתוח מקומי: `GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`.

### Frontend (Vercel + `.env.local` מקומי)
```
GOOGLE_CLIENT_ID=<client id>          # אינו סוד — משמש לבניית כתובת ההפניה
GOOGLE_CALLBACK_URL=https://der-shtele.vercel.app/api/auth/google/callback
```
(הפרונט כבר משתמש ב-`BACKEND_API_URL` הקיים כדי לדבר עם הבק.)

> ה-`GOOGLE_CLIENT_SECRET` נשמר **רק בבק**, לעולם לא בפרונט.

## 3. מיגרציה (כבר הוחלה ב-DB המשותף)

`backend/prisma/migrations/20260617150000_add_google_oauth_and_optin_prompt`
הוחלה עם `prisma migrate deploy`. היא אדיטיבית ותואמת-לאחור: `passwordHash` הפך
nullable, ונוספו `authProvider`, `googleId`, `profilePicture`, `optInPromptedAt`.

## 4. איך הזרימה עובדת (תזכורת)

```
כפתור → /api/auth/google/start (Vercel) → 302 ל-accounts.google.com
  → אישור → /api/auth/google/callback (Vercel) — מאמת state, שולח code לבק
  → הבק: exchange + verify id_token + find-or-create-and-link → JWT
  → /auth/complete#token=… → נשמר ב-localStorage → /account
```
- **קישור אוטומטי:** אימייל מגוגל שכבר קיים מקושר לאותו חשבון (גם אם יש סיסמה).
- **opt-in:** משתמש Google נוצר ללא הסכמה לדיוור; תזכורת עדינה באזור האישי תופיע
  מיד ואז שוב רק אחרי ~30 יום.

## 5. אימות end-to-end

1. **משתמש חדש:** לחיצה על הכפתור → מסך Google → אישור → נחיתה ב-`/account` מחובר.
   בדיקה ב-DB: `authProvider=google`, `googleId` מאוכלס, `passwordHash=null`,
   `optInMarketing=false`.
2. **קישור אוטומטי:** הירשם קודם באימייל+סיסמה, אז התחבר בגוגל עם אותו אימייל →
   אותו משתמש, עדיין אפשר להתחבר גם בסיסמה.
3. **התחברות חוזרת:** התחבר שוב בגוגל → בלי כפילות.
4. **תזכורת opt-in:** משתמש Google נכנס ל-`/account` → באנר מופיע. "כן" →
   `optInMarketing=true` והבאנר נעלם; רענון → לא חוזר. כדי לבדוק חזרה: הזז את
   `optInPromptedAt` ב-DB 31 יום אחורה → הבאנר חוזר.
5. **כשל גרייספול:** אם Google חסום (NetFree) או שה-state לא תואם → נחיתה ב-
   `/login?error=google` עם הודעה, וההתחברות באימייל זמינה כרגיל.

## הערה על NetFree

OAuth מחייב שהדפדפן יגיע ל-`accounts.google.com`. אצל חלק מסינוני NetFree זה חסום,
ואז הכפתור לא ייטען — לכן הוא **תוספת** לצד אימייל+סיסמה, לא תחליף.
