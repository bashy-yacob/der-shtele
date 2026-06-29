import type { Icon } from "@/lib/icons";
import { House, Briefcase, Buildings, Info, ChatCircle } from "@/lib/icons";

/** קישורי הניווט הראשיים — משותפים בין הניווט בדסקטופ לתפריט המובייל. */
export type NavLink = { href: string; label: string; icon: Icon };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "דף הבית", icon: House },
  { href: "/jobs", label: "לוח משרות", icon: Briefcase },
  { href: "/employers", label: "למעסיקים", icon: Buildings },
  { href: "/about", label: "אודות", icon: Info },
  { href: "/contact", label: "צור קשר", icon: ChatCircle },
];
