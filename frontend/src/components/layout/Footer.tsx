import Link from "next/link";
import { Phone, EnvelopeSimple, Clock, ShieldCheck } from "@/lib/icons";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/jobs", label: "לוח משרות" },
  { href: "/employers", label: "למעסיקים" },
  { href: "/about", label: "לעובדים" },
  { href: "/contact", label: "צור קשר" },
  { href: "/register", label: "הרשמה" },
];

export function Footer() {
  return (
    <footer className="bg-navy-800 text-sand-200 text-sm" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* לוגו + תיאור */}
        <div>
          <p className="flex items-center gap-1 font-logo text-xl font-bold text-white mb-2">
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
            <li className="flex items-center gap-2">
              <Phone className="w-[1.15rem] h-[1.15rem] text-olive-300 shrink-0" />
              <span>טל׳: {CONTACT_INFO.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeSimple className="w-[1.15rem] h-[1.15rem] text-olive-300 shrink-0" />
              <span>מייל: {CONTACT_INFO.email}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-[1.15rem] h-[1.15rem] text-olive-300 shrink-0" />
              <span>{CONTACT_INFO.hours}</span>
            </li>
            <li className="flex items-center gap-2 text-olive-300">
              <ShieldCheck className="w-[1.15rem] h-[1.15rem] shrink-0" />
              <span>{CONTACT_INFO.note}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="max-w-5xl mx-auto px-4 py-5 text-sand-400 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. כל הזכויות שמורות.
          </span>
          <span>
            האתר נבנה על ידי{" "}
            <a
              href="https://bashy-yacob.github.io/portfolio/#hero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand-300 hover:text-olive-300 transition-colors underline-offset-2 hover:underline"
            >
              Bashy Klein
            </a>{" "}
            ·{" "}
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
