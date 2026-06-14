// shabbat — בדיקה לפני שליחת מיילים / התראות אוטומטיות.
// שימוש: if (!isShabbatOrHoliday()) { await sendEmail(...) }
//
// TODO: להחליף את ההערכה לפי שעון בקריאה ל-Hebcal REST API לחגים מדויקים
// https://www.hebcal.com/home/195/jewish-calendar-rest-api

/** שעות כניסת/יציאת שבת משוערות לישראל לפי עונה */
const SHABBAT_TIMES = {
  summer: { in: 19, out: 20.5 }, // קיץ
  winter: { in: 16, out: 17.5 }, // חורף
} as const;

function isSummer(date: Date): boolean {
  const month = date.getMonth() + 1; // 1–12
  return month >= 4 && month <= 9;
}

/** ממיר שעה ל-שעון ישראל (UTC+2 חורף / UTC+3 קיץ) */
function israelHour(now: Date): number {
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const offset = isSummer(now) ? 3 : 2;
  return (utcHour + offset) % 24;
}

/** האם עכשיו שבת בישראל? (לפי יום השבוע ושעה משוערת) */
export function isShabbat(now: Date = new Date()): boolean {
  const hour = israelHour(now);
  const day = now.getUTCDay(); // 0=ראשון ... 6=שבת
  const times = isSummer(now) ? SHABBAT_TIMES.summer : SHABBAT_TIMES.winter;

  // שישי אחרי כניסת שבת
  if (day === 5 && hour >= times.in) return true;
  // שבת לפני צאת שבת
  if (day === 6 && hour < times.out) return true;

  return false;
}

/** בדיקה משולבת — שבת או חג. בשלב ב להרחיב עם Hebcal. */
export function isShabbatOrHoliday(now: Date = new Date()): boolean {
  return isShabbat(now);
}

/**
 * מחזיר את הזמן הבא שבו מותר לשלוח (אחרי צאת שבת/חג).
 * שימושי לתזמון מיילים בתור.
 */
export function nextAllowedSendTime(now: Date = new Date()): Date {
  if (!isShabbatOrHoliday(now)) return now;

  const next = new Date(now);
  // קופץ לשעה שאחרי צאת שבת באותו ערב; אם עדיין שבת — ליום ראשון
  const times = isSummer(now) ? SHABBAT_TIMES.summer : SHABBAT_TIMES.winter;
  const offset = isSummer(now) ? 3 : 2;
  next.setUTCHours(Math.ceil(times.out - offset), 30, 0, 0);
  if (next.getUTCDay() === 6 && israelHour(next) < times.out) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next > now ? next : new Date(now.getTime() + 60 * 60 * 1000);
}
