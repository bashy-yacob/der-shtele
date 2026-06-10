import type { JobField, Region, Gender } from '@/types';

// ---- תרגום תחומים לעברית ----
export const FIELD_LABELS: Record<JobField, string> = {
  logistics: 'לוגיסטיקה ושילוח',
  admin:     'מנהלה ומשרד',
  sales:     'מכירות ושיווק',
  education: 'חינוך והוראה',
  tech:      'מחשבים וטכנולוגיה',
  finance:   'חשבונאות וכספים',
  healthcare:'בריאות ורפואה',
  other:     'אחר',
};

// ---- תרגום אזורים לעברית ----
export const REGION_LABELS: Record<Region, string> = {
  bnei_brak:   'בני ברק',
  jerusalem:   'ירושלים',
  elad:        'אלעד',
  modiin_ilit: 'מודיעין עילית',
  beitar_ilit: 'ביתר עילית',
  other:       'אחר',
};

// ---- תרגום מגדר לעברית ----
export const GENDER_LABELS: Record<Gender, string> = {
  men:    'לגברים',
  women:  'לנשים',
  mixed:  'מעורב',
};

// ---- שם האתר ----
export const SITE_NAME = 'דער שטעלע';
export const SITE_TAGLINE = 'מוצאים לך את המשרה הנכונה';
export const SITE_SUBTITLE = 'סוכנות השמה מקצועית לציבור החרדי בישראל. אנחנו מטפלים בכל הפרטים - אתם עובדים בעבודה.';

// ---- פרטי קשר של הסוכנות ----
export const CONTACT_INFO = {
  phone:  '050-000-0000',
  email:  'info@dershtele.co.il',
  hours:  'א׳–ה׳: 09:00–18:00 · ערב שישי: 09:00–12:00',
  note: 'אין מענה בשבת ויום טוב',
} as const;

// ---- טקסטים ובנושאי אתר ----
export const SITE_CONTENT = {
  hero: {
    title: SITE_NAME,
    tagline: SITE_TAGLINE,
    subtitle: SITE_SUBTITLE,
    buttonPrimary: 'שלח קורות חיים עכשיו',
    buttonSecondary: 'צפה במשרות',
  },
  
  steps: {
    title: 'איך זה עובד — שלושה שלבים',
    list: [
      {
        title: 'שלחו קורות חיים',
        desc: 'ממלאים טופס קצר ומעלים קורות חיים',
      },
      {
        title: 'אנחנו עושים את העבודה',
        desc: 'עובדים שלנו עוברים, מסננים ויצגים אתכם לעובדים המתאימים',
      },
      {
        title: 'מתאים? נחזור אליכם',
        desc: 'עם הצעה קונקרטית',
      },
    ],
  },

  stats: {
    title: 'מספרי סטטיסטיקה',
    list: [
      { label: 'משרות פעילות', value: 'XX+' },
      { label: 'גיוסים מוצלחים', value: 'XX' },
      { label: 'ערים', value: 'בני ברק, ירושלים, אלעד, מודיעין עילית, ביתר עילית ועוד' },
    ],
  },

  trust: {
    title: 'סוכנות השמה מקצועית',
    items: [
      'שמירה על צניעות ופרטיות',
      'ללא גישה ישירה של מועמדים למועמדים',
      'ללא פרסומות',
    ],
  },

  about: {
    title: 'אודות התפקיד',
    subtitle: 'סוכנות השמה שנבנתה מתוך הציבור, בשבילו',
    story: 'המניעה נוסדה מתוך צורך אמיתי ואתי — למצוא פתרון השמה שמכיר את הציבור החרדי, את ערכיו צרכיו מיוחדים. אנחנו לא מכונה אוטומטית. כל מועמד מקבל טיפול סדור, כל משרה עוברת בדיקה קפדנית, וכל גיוס מלווה ע"י אנשים אמיתיים שמים את השוק.',
    values: [
      { title: 'פרטיות', desc: 'קשר פרטי נשמרים אצלנו — שום קשר ישיר ללא אישור' },
      { title: 'צניעות', desc: 'ממשק נקי ומכובד ללא תמונות ופרסומות' },
      { title: 'אמינות', desc: 'מחויבות לתהליך ישר ושקוף לשני פנים' },
      { title: 'קהילה', desc: 'מכירים את הציבור ועובדים לפי ערכיו' },
    ],
  },

  jobsPage: {
    title: 'משרות פתוחות',
    subtitle: 'כל המשרות מועברות דרכנו — פרטי השרות נמסרים תוך מתקדם',
    filters: {
      field: 'תחום עיסוק',
      region: 'אזור',
      gender: 'מגדר',
      scope: 'כמות',
    },
    empty: 'לא נמצא משרות מתאימות לחיפוש זה.',
    emptyOffer: 'השארו קורות חיים ואנחנו נדאג ליידע אתכם כשתיפתח משרה מתאים.',
  },

  contact: {
    title: 'צור קשר',
    subtitle: 'שמחים לשמוע — בין אם אתה מועמד ובין אם אתה עובד המחפש כוח אדם',
  },

  messages: {
    success: {
      candidate: 'תודה! קיבלנו את פנייתך. יצור אתך קשר בהקדם.',
      contact: 'תודה על פנייתך! נחזור אליך בהקדם האפשרי.',
    },
    error: {
      fieldRequired: 'יש למלא שדה זה כדי להמשיך',
      invalidFile: 'נא לצרף קובץ בפורמט PDF או Word בלבד',
      serverError: 'אירעה שגיאה בעת השליחה. נא לנסות שוב או לפנות אלינו.',
    },
  },
} as const;
