import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { AdminHeaderLink } from "./AdminHeaderLink";

const NAV_LINKS = [
  { href: "/", label: "דף הבית" },
  { href: "/jobs", label: "לוח משרות" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];

export function Header() {
  return (
    <header
      className="bg-sand-50/85 backdrop-blur-md border-b border-sand-200 sticky top-0 z-50"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ימין: לוגו וניווט */}
        <div className="flex items-center gap-8">
          {/* wordmark מותגי — סריף navy עם נקודת olive */}
          <Link
            href="/"
            className="flex items-center gap-1 font-display text-2xl font-bold text-navy-600 tracking-tight"
          >
            <span>{SITE_NAME}</span>
            <span className="w-1.5 h-1.5 bg-olive-500 rounded-full shrink-0 mb-1" />
          </Link>

          {/* ניווט ראשי */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-ink-500">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-navy-600 transition-colors py-1.5"
              >
                {link.label}
              </Link>
            ))}
            <AdminHeaderLink />
          </nav>
        </div>

        {/* שמאל: כניסה + CTA הרשמה */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-semibold text-ink-500 hover:text-navy-600 transition-colors"
          >
            כניסה
          </Link>
          <Link
            href="/register"
            className="bg-navy-600 hover:bg-navy-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors duration-150 text-center"
          >
            הרשמה ←
          </Link>
        </div>
      </div>
    </header>
  );
}
