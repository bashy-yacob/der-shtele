import type { PublicJob } from '@/types';

// נתוני דמה לפיתוח — יוחלפו ב-DB אמיתי בהמשך
export const MOCK_JOBS: PublicJob[] = [
  {
    id: '1',
    title: 'מנהל לוגיסטיקה',
    description: 'חברה ותיקה במרכז הארץ מחפשת מנהל לוגיסטיקה עם ניסיון של לפחות 3 שנים. תפקיד מלא עם אחריות על ניהול מחסן וצוות עובדים.',
    field: 'logistics',
    region: 'bnei_brak',
    gender: 'men',
    scope: 'משרה מלאה',
    rabbinicalApproval: true,
    createdAt: '2024-07-01',
  },
  {
    id: '2',
    title: 'מזכירה / פקידת קבלה',
    description: 'משרד עורכי דין בירושלים מחפש מזכירה מסודרת ואדיבה. היקף משרה גמיש, ניסיון במשרד יתרון.',
    field: 'admin',
    region: 'jerusalem',
    gender: 'women',
    scope: 'משרה חלקית',
    rabbinicalApproval: false,
    createdAt: '2024-07-03',
  },
  {
    id: '3',
    title: 'מורה לתנ"ך ומתמטיקה',
    description: 'מוסד חינוכי מוכר מחפש מורה לכיתות ה׳–ח׳. דרישה: תעודת הוראה. סביבת עבודה נעימה ותומכת.',
    field: 'education',
    region: 'elad',
    gender: 'women',
    scope: 'משרה מלאה',
    rabbinicalApproval: true,
    createdAt: '2024-07-05',
  },
];
