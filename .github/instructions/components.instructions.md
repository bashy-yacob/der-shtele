---
name: React & Components
description: כללי כתיבת קומפוננטות React בפרויקט
applyTo: 'src/components/**/*.tsx,src/app/**/*.tsx'
---

# React — כללי כתיבת קומפוננטות

## Server vs Client
- ברירת מחדל: **Server Component** — לא לכתוב `'use client'` בלי סיבה
- `'use client'` רק כשצריך: useState, useEffect, event handlers, form עם ולידציה דינמית
- לחלץ את החלק הדינמי לרכיב client קטן ולעטוף ב-server component גדול יותר

## עיצוב — Tailwind בלבד
```tsx
// ✅ נכון
<div className="card hover:shadow-md transition-shadow">

// ❌ אסור
<div style={{ padding: '16px', background: '#fff' }}>
```

## class names — כלי עזר
```ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// לשילוב classes תנאיים
const cn = (...args) => twMerge(clsx(args));
```

## קומפוננטות UI חוזרות
Classes מוגדרות ב-globals.css — להשתמש בהן:
- `btn-primary` — כפתור ראשי
- `btn-outline` — כפתור משני
- `input-field` — שדה קלט
- `card` — קונטיינר עם צל ומסגרת

## RTL
- אין להשתמש ב-`left`/`right` ב-Tailwind — להשתמש ב-`start`/`end`
```tsx
// ✅ תואם RTL
<div className="ms-4 pe-2">  {/* margin-start, padding-end */}

// ❌ יישבר ב-RTL
<div className="ml-4 pr-2">
```

## אין תמונות אנשים
```tsx
// ❌ אסור בכל מקום באתר
<img src="/person.jpg" />
<Image src={userAvatar} />

// ✅ אייקונים ניטרליים מותרים
<span className="text-2xl">📋</span>
```
