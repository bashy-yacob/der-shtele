import Link from "next/link";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/jobs", label: "לוח משרות" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
  { href: "/register", label: "הרשמה" },
];

export function Footer() {
  return (
    <footer className="bg-navy-800 text-sand-200 text-sm" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* לוגו + תיאור */}
        <div>
          <p className="flex items-center gap-1 font-display text-xl font-bold text-white mb-2">
            <span>{SITE_NAME}</span>
            <span className="w-1.5 h-1.5 bg-olive-500 rounded-full shrink-0 mb-1" />
          </p>
          <p className="text-sand-300 leading-relaxed">
            סוכנות השמה מקצועית לציבור החרדי בישראל. כל קשר עובר דרך הצוות.
          </p>
        </div>

        {/* ניווט */}
        <div>
          <p className="font-semibold text-white mb-3">ניווט</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sand-300 hover:text-olive-300 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* יצירת קשר */}
        <div>
          <p className="font-semibold text-white mb-3">יצירת קשר</p>
          <ul className="space-y-2 text-sand-300">
            <li>טל׳: {CONTACT_INFO.phone}</li>
            <li>מייל: {CONTACT_INFO.email}</li>
            <li>{CONTACT_INFO.hours}</li>
            <li className="text-olive-300">{CONTACT_INFO.note}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="max-w-5xl mx-auto px-4 py-5 text-sand-400 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. כל הזכויות שמורות.
          </span>
          <span>
            האתר נבנה על ידי Bashy Klein ·{" "}
            <a
              href="mailto:bashy3309@gmail.com"
              className="text-sand-300 hover:text-olive-300 transition-colors"
            >
              bashy3309@gmail.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
