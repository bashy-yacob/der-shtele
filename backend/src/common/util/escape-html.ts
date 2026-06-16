/**
 * בריחת תווים מיוחדים ל-HTML — למניעת הזרקת מארקאפ (XSS) כשמשבצים קלט
 * משתמש בתוך גוף מייל/HTML. להשתמש על כל ערך שמקורו במשתמש.
 */
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
