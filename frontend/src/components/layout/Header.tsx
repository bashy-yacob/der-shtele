import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { AdminHeaderLink } from "./AdminHeaderLink";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS, JOBS_LINK } from "./nav-links";

export function Header() {
  const JobsIcon = JOBS_LINK.icon;
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
            className="flex items-center gap-1 font-logo text-2xl font-bold text-navy-600 tracking-tight"
          >
            <span>{SITE_NAME}</span>
            <span className="w-1.5 h-1.5 bg-olive-500 rounded-full shrink-0 mb-1" />
          </Link>

          {/* ניווט ראשי */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-ink-500">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 hover:text-navy-600 transition-colors py-1.5"
                >
                  <Icon className="w-[1.05rem] h-[1.05rem] text-olive-500/90" />
                  {link.label}
                </Link>
              );
            })}
            <AdminHeaderLink />
          </nav>
        </div>

        {/* שמאל: ה-CTA הראשי (לוח המשרות) + אזור המשתמש + המבורגר במובייל */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={JOBS_LINK.href}
            aria-label={JOBS_LINK.label}
            className="inline-flex items-center gap-1.5 bg-olive-600 hover:bg-olive-700 text-white text-sm font-bold px-3 sm:px-5 py-2.5 rounded-xl shadow-soft transition-colors duration-150"
          >
            <JobsIcon className="w-5 h-5 sm:w-[1.05rem] sm:h-[1.05rem]" />
            <span className="hidden sm:inline">{JOBS_LINK.label}</span>
          </Link>
          <UserMenu />
          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
