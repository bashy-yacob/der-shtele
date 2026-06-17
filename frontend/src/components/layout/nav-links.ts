/** קישורי הניווט הראשיים — משותפים בין הניווט בדסקטופ לתפריט המובייל. */
export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "דף הבית" },
  { href: "/jobs", label: "לוח משרות" },
  { href: "/employers", label: "למעסיקים" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];
