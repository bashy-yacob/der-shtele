---
name: TypeScript Standards
description: כללי TypeScript לכל הפרויקט
applyTo: '**/*.ts,**/*.tsx'
---

# TypeScript — כללי הפרויקט

## טיפוסים
- strict mode פעיל — אין להשתמש ב-`any`
- `unknown` במקום `any` כשהטיפוס לא ידוע, עם narrowing
- טיפוסים משותפים מיובאים תמיד מ-`@/types` — לא להגדיר מחדש

## ייבוא טיפוסים
```ts
// ✅ תמיד type import לטיפוסים בלבד
import type { PublicJob, Gender } from '@/types';

// ✅ ייבוא מעורב
import { FIELD_LABELS, type JobField } from '@/lib/constants';
```

## async / שגיאות
```ts
// ✅ try/catch עם שגיאה מוקלדת
try {
  const data = await fetchSomething();
} catch (error) {
  const message = error instanceof Error ? error.message : 'שגיאה לא ידועה';
}
```

## React קומפוננטות
```tsx
// ✅ interface מפורש תמיד, גם ל-props פשוטות
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
```
