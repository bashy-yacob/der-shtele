// lib/shabbat.ts
// בדיקה פשוטה לפני שליחת מיילים / התראות אוטומטיות
// לשימוש: if (!isShabbatOrHoliday()) { await sendEmail(...) }
//
// שלב ב: כדאי להחליף ב-API של Hebcal לבדיקת חגים מדויקת
// https://www.hebcal.com/home/195/jewish-calendar-rest-api

/** שעות כניסת/יציאת שבת משוערות לישראל לפי עונה */
const SHABBAT_TIMES = {
  summer: { in: 19, out: 20.5 }, // קיץ: כניסה 19:00, יציאה 20:30
  winter: { in: 16, out: 17.5 }, // חורף: כניסה 16:00, יציאה 17:30
} as const;

function isSummer(date: Date): boolean {
  const month = date.getMonth() + 1; // 1–12
  return month >= 4 && month <= 9;
}

/**
 * האם עכשיו שבת בישראל?
 * בדיקה לפי שעון ישראל (UTC+2/+3) ויום השבוע.
 */
export function isShabbat(now: Date = new Date()): boolean {
  // המרה לשעון ישראל (UTC+2 חורף, UTC+3 קיץ)
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const israelOffset = isSummer(now) ? 3 : 2;
  const israelHour = (utcHour + israelOffset) % 24;
  const dayUTC = now.getUTCDay(); // 0=ראשון ... 6=שבת

  // יום ישראלי — לאחר ההמרה
  const dayIsrael = israelHour < (utcHour + israelOffset >= 24 ? 0 : 0)
    ? (dayUTC + 1) % 7
    : dayUTC;

  const times = isSummer(now) ? SHABBAT_TIMES.summer : SHABBAT_TIMES.winter;

  // שישי אחרי כניסת שבת
  if (dayIsrael === 5 && israelHour >= times.in) return true;
  // שבת לפני יציאת שבת
  if (dayIsrael === 6 && israelHour < times.out) return true;

  return false;
}

/**
 * בדיקה פשוטה — האם שבת או חג?
 * בשלב ב: להרחיב עם Hebcal API לחגים מדויקים.
 */
export function isShabbatOrHoliday(now: Date = new Date()): boolean {
  // TODO שלב ב: await checkHebcalHoliday(now)
  return isShabbat(now);
}

/**
 * מחזיר את הזמן הבא שבו מותר לשלוח (אחרי צאת שבת/חג)
 * שימושי לתזמון מיילים שנשמרו בתור
 */
export function nextAllowedSendTime(now: Date = new Date()): Date {
  if (!isShabbatOrHoliday(now)) return now;

  const next = new Date(now);
  const israelOffset = isSummer(now) ? 3 : 2;
  const times = isSummer(now) ? SHABBAT_TIMES.summer : SHABBAT_TIMES.winter;

  // מגדיר ליום ראשון אחרי שבת
  next.setUTCHours(times.out - israelOffset + 0.5, 30, 0, 0); // 30 דק' אחרי צאת שבת
  const dayUTC = next.getUTCDay();
  if (dayUTC === 6) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next;
}
