"use client";

// פורטל המעסיקים — שער כניסה role=employer + ניווט. נפרד מהאתר הציבורי.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PORTAL_NAV = [
  { href: "/portal", label: "המשרות שלי" },
  { href: "/portal/jobs/new", label: "פרסום משרה" },
  { href: "/portal/commissions", label: "עמלות וחשבוניות" },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // עמוד הכניסה לפורטל פתוח (אין צורך בהזדהות מוקדמת).
  const isLoginPage = pathname === "/portal/login";

  useEffect(() => {
    if (isLoginPage || loading) return;
    if (!user) router.replace("/portal/login");
  }, [isLoginPage, loading, user, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center text-ink-500">
        טוען...
      </main>
    );
  }

  // מחובר אך אינו מעסיק — אין גישה לפורטל.
  if (user.role !== "employer") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="font-display text-2xl text-ink-900 mb-3">
          פורטל מעסיקים
        </h1>
        <p className="text-ink-500 mb-6">
          אזור זה מיועד למעסיקים בלבד. פרטי כניסה מופקים על ידי הצוות.
        </p>
        <Link href="/" className="text-navy-600 font-semibold hover:underline">
          לאתר הראשי ←
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12" dir="rtl">
      <div className="grid md:grid-cols-4 gap-6 md:gap-8">
        <aside className="md:col-span-1">
          <div className="mb-3 px-2">
            <p className="text-xs text-ink-400">פורטל מעסיקים</p>
            <p className="font-display text-ink-900 font-bold leading-tight">
              {user.fullName}
            </p>
          </div>
          <nav className="flex flex-wrap md:flex-col gap-1 bg-white rounded-2xl border border-sand-200 shadow-soft p-2">
            {PORTAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 sm:px-4 py-2.5 rounded-xl text-sm transition-colors text-start whitespace-nowrap",
                  pathname === item.href
                    ? "bg-navy-50 text-navy-700 font-bold"
                    : "text-ink-500 font-semibold hover:text-navy-600 hover:bg-sand-50",
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-start whitespace-nowrap transition-colors md:mt-1 md:border-t md:border-sand-200 md:rounded-t-none"
            >
              התנתקות
            </button>
          </nav>
        </aside>
        <section className="md:col-span-3 min-w-0">{children}</section>
      </div>
    </main>
  );
}
