---
name: API Routes
description: כללי כתיבת API routes ב-Next.js
applyTo: 'src/app/api/**/*.ts'
---

# API Routes — כללים

## מבנה תקני
כל route חייב לעקוב אחרי התבנית הזו:

```ts
import { NextResponse } from 'next/server';
import { someSchema } from '@/lib/validations';
import type { ApiResponse } from '@/types';

export async function POST(req: Request) {
  try {
    // 1. פרסור body
    const body = await req.json();

    // 2. ולידציה עם Zod — תמיד
    const parsed = someSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      );
    }

    // 3. לוגיקה עסקית
    const data = parsed.data;
    // ...

    // 4. תגובה
    return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result });
  } catch (error) {
    console.error('[API ERROR]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'שגיאת שרת' },
      { status: 500 }
    );
  }
}
```

## אבטחה
- לא לחשוף פרטי מעסיקים ב-GET routes ציבוריים — רק `PublicJob`
- routes של CRM (שלב ב) יהיו מוגנים ב-JWT + role check לפני כל לוגיקה
- לא לרשום מידע אישי ב-console.log בפרודקשן

## מיילים — שבת
לפני כל שליחת מייל אוטומטי, לבדוק:
```ts
import { isShabbat } from '@/lib/shabbat'; // TODO: לממש בשלב ב
if (!isShabbat()) { await sendEmail(...); }
```
