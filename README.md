# דער שטעלע — Der Shtele

סוכנות השמה דיגיטלית לציבור החרדי בישראל.

## טכנולוגיות

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form + Zod** (ולידציה)

## התחלה מהירה

```bash
npm install
npm run dev
```

האתר יעלה בכתובת: http://localhost:3000

## מבנה הפרויקט

```
src/
├── app/                    # App Router
│   ├── page.tsx            # דף בית
│   ├── jobs/               # לוח משרות + דף משרה
│   ├── contact/            # טופס הגשת מועמדות
│   ├── about/              # דף אודות
│   └── api/                # API Routes
│       ├── candidates/     # POST — קבלת פנייה
│       └── jobs/           # GET — רשימת משרות
├── components/
│   ├── layout/             # Header, Footer
│   ├── jobs/               # JobCard
│   └── forms/              # (לשימוש עתידי)
├── lib/
│   ├── constants.ts        # תוויות, פרטי קשר, שם אתר
│   ├── mockData.ts         # נתוני דמה לפיתוח
│   └── validations.ts      # Zod schemas
├── types/
│   └── index.ts            # טיפוסי TypeScript משותפים
└── styles/
    └── globals.css         # סגנונות גלובליים + RTL
```

## שלבי פיתוח

### ✅ שלב א — אתר ציבורי (נוכחי)
- [x] לוח משרות אנונימי עם פילטרים
- [x] דף משרה בודד
- [x] טופס הגשת מועמדות + ולידציה
- [x] דף אודות + צור קשר
- [x] RTL + עברית + עיצוב שמרני
- [ ] חיבור מייל אמיתי (Nodemailer/Resend)
- [ ] העלאת קבצים (Supabase Storage)

### 🔲 שלב ב — CRM פנימי
- [ ] ניהול מועמדים
- [ ] ניהול משרות (פנימי + ציבורי)
- [ ] ניהול מעסיקים
- [ ] מערכת סטטוסים

### 🔲 שלב ג — שדרוגים
- [ ] לוח בקרה עם סטטיסטיקות
- [ ] מערכת תזכורות
- [ ] ניהול עמלות

## משתני סביבה

```env
# .env.local
TEAM_EMAIL=your@email.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## פריסה (Vercel)

```bash
vercel deploy
```
