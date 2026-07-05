import Link from "next/link";
import { SkylineMotif } from "@/components/ui/SkylineMotif";

interface AuthShellProps {
  /** כותרת הטופס. */
  title: string;
  /** תת-כותרת קצרה מתחת לכותרת. */
  subtitle?: string;
  /** מסר המיתוג שמופיע בפאנל הצדדי. */
  panelTitle: string;
  panelPoints: string[];
  children: React.ReactNode;
  /** שורת מעבר תחתונה (יש/אין חשבון). */
  footer: React.ReactNode;
}

/**
 * מעטפת אחידה לעמודי כניסה/הרשמה — פאנל מיתוג navy לצד כרטיס הטופס.
 * RTL מלא, ללא תמונות אנשים, מוטיב קו-רקיע דקורטיבי בלבד.
 */
export function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelPoints,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main
      className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16"
      dir="rtl"
    >
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white border border-sand-200 rounded-2xl shadow-soft overflow-hidden animate-fade-up">
        {/* פאנל מיתוג */}
        <aside className="relative hidden md:flex flex-col justify-between bg-navy-600 text-white p-9 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 text-navy-500/70"
            aria-hidden="true"
          >
            <SkylineMotif className="w-full h-full" />
          </div>

          <Link
            href="/"
            className="relative font-logo text-2xl font-bold tracking-tight"
          >
            דער שטעלע
          </Link>

          <div className="relative">
            <h2 className="font-display text-2xl font-bold leading-snug mb-6 text-white">
              {panelTitle}
            </h2>
            <ul className="space-y-3">
              {panelPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <svg
                    className="w-5 h-5 text-olive-300 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sand-200 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* טופס */}
        <div className="p-8 sm:p-10">
          {/* סמל מותג עדין — נותן זהות גם במובייל (שם פאנל המיתוג הצדדי מוסתר).
              סמל גאומטרי בלבד, ללא פנים/אנשים (כלל הצניעות). מקושר לעמוד הבית. */}
          <Link
            href="/"
            aria-label="דער שטעלע — לעמוד הבית"
            className="mb-6 inline-flex"
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <rect width="40" height="40" rx="10" fill="#2f4ac0" />
              <path
                d="M12 27V13h5.5a7 7 0 0 1 0 14H12Zm4-3.2h1.5a3.8 3.8 0 0 0 0-7.6H16v7.6Z"
                fill="#fff"
              />
              <circle cx="28.5" cy="14" r="2.5" fill="#dde6ff" />
            </svg>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-ink-500 mb-6">{subtitle}</p>}
          <div className={subtitle ? "" : "mt-6"}>{children}</div>
          <div className="text-sm text-ink-700 text-center mt-6">{footer}</div>
        </div>
      </div>
    </main>
  );
}
