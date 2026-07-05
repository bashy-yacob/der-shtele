/**
 * מאמת נתיב יעד שהגיע מ-?redirect ומעדיף אותו כשהוא קיים ובטוח — נתיב יחסי
 * (מתחיל ב-"/" אך לא ב-"//"), ולא עמוד הרשמה/כניסה (מונע לולאת חזרה). רק אם
 * ה-raw חסר/לא בטוח נופלים ל-fallback. מונע open-redirect לאתר חיצוני.
 */
export function safeRedirect(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // לא לחזור אל עמוד ההרשמה/כניסה עצמו — היה יוצר לולאת ניתוב.
  const path = raw.split(/[?#]/)[0];
  if (path === "/login" || path === "/register") return fallback;
  return raw;
}

/**
 * יעד ברירת מחדל לפי תפקיד המשתמש, כשאין ?redirect מפורש — מעסיק לפורטל,
 * צוות לדשבורד, וכל השאר לאזור האישי.
 */
export function defaultDestForRole(role: string | undefined): string {
  if (role === "employer") return "/portal";
  if (role === "staff" || role === "admin") return "/admin";
  return "/account";
}
