import type { Icon } from "@/lib/icons";
import {
  Briefcase,
  Buildings,
  IdentificationCard,
  ChatCircle,
} from "@/lib/icons";

/** קישורי הניווט הראשיים — משותפים בין הניווט בדסקטופ לתפריט המובייל. */
export type NavLink = { href: string; label: string; icon: Icon };

/**
 * קישורי הניווט המשניים — מוצגים אחרי הלוגו בדסקטופ ובתפריט המובייל.
 * "דף הבית" הוסר בכוונה — הלוגו עצמו כבר מוביל לדף הבית.
 */
export const NAV_LINKS: NavLink[] = [
  { href: "/employers", label: "למעסיקים", icon: Buildings },
  { href: "/about", label: "לעובדים", icon: IdentificationCard },
  { href: "/contact", label: "צור קשר", icon: ChatCircle },
];

/** ה-CTA הראשי של האתר — לוח המשרות. מוצג ככפתור בולט בצד שמאל של ה-Header. */
export const JOBS_LINK: NavLink = {
  href: "/jobs",
  label: "לוח המשרות",
  icon: Briefcase,
};
