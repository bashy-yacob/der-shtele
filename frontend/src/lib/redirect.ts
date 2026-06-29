/**
 * מאמת נתיב יעד שהגיע מ-?redirect ומחזיר אותו רק אם הוא נתיב יחסי בטוח
 * (מתחיל ב-"/" אך לא ב-"//") — אחרת את ברירת המחדל. מונע open-redirect לאתר חיצוני.
 */
export function safeRedirect(
  raw: string | null | undefined,
  fallback: string,
): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
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
