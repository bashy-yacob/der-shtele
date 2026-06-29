"use client";

// פורטל המעסיקים — שער כניסה role=employer + ניווט. נפרד מהאתר הציבורי.
// שלושה מצבי גישה: לא מחובר → נחיתה /employers בלבד; מחובר pending/rejected →
// מסך "ממתין לאישור"; מחובר approved → פורטל מלא.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getPortalMe, type PortalEmployer } from "@/lib/portal-api";
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

  // עמודי הכניסה וההרשמה פתוחים (אין צורך בהזדהות מוקדמת).
  const isPublicPage =
    pathname === "/portal/login" || pathname === "/portal/register";

  // סטטוס המעסיק נקרא חי מ-/portal/me (לא מה-JWT) — מניע את מסך ההמתנה.
  const [me, setMe] = useState<PortalEmployer | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // גולש לא-מחובר שמנסה להיכנס לפורטל מועבר לעמוד הנחיתה שמזמין להירשם —
  // לא לטופס הכניסה, וללא הצצה לאף עמוד פורטל.
  useEffect(() => {
    if (isPublicPage || loading) return;
    if (!user) router.replace("/employers");
  }, [isPublicPage, loading, user, router]);

  useEffect(() => {
    if (isPublicPage || user?.role !== "employer") return;
    let active = true;
    getPortalMe()
      .then((m) => {
        if (active) setMe(m);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setMeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isPublicPage, user]);

  if (isPublicPage) return <>{children}</>;

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
        <p className="text-ink-500 mb-6">אזור זה מיועד למעסיקים בלבד.</p>
        <Link href="/" className="text-navy-600 font-semibold hover:underline">
          לאתר הראשי ←
        </Link>
      </main>
    );
  }

  // ממתין לקריאת הסטטוס — מונע הבהוב של הדשבורד/ניווט הפרסום למעסיק pending.
  if (meLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center text-ink-500">
        טוען...
      </main>
    );
  }

  // מעסיק שטרם אושר — מסך המתנה במקום הפורטל.
  if (me && me.status !== "approved") {
    return <PendingApprovalScreen status={me.status} onLogout={logout} />;
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

/** מסך המעסיק שטרם אושר — ממתין לאישור הצוות, או בקשה שנדחתה. */
function PendingApprovalScreen({
  status,
  onLogout,
}: {
  status: "pending" | "rejected";
  onLogout: () => void;
}) {
  const rejected = status === "rejected";
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center" dir="rtl">
      <div className="bg-white rounded-2xl border border-sand-200 shadow-soft p-8">
        <h1 className="font-display text-2xl text-ink-900 mb-3">
          {rejected ? "הבקשה לא אושרה" : "החשבון ממתין לאישור"}
        </h1>
        <p className="text-ink-700 leading-relaxed mb-6">
          {rejected
            ? "לאחר בחינה, בקשת ההצטרפות לא אושרה כעת. לפרטים נוספים אפשר לפנות לצוות דער שטעלע."
            : "תודה שנרשמתם. הצוות יאמת את הפרטים ויאשר את החשבון בהקדם — נעדכן אתכם במייל ברגע שהחשבון יאושר, ואז תוכלו לפרסם משרות."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            התנתקות
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-navy-600 border border-navy-100 hover:bg-navy-50 transition-colors"
          >
            לאתר הראשי
          </Link>
        </div>
      </div>
    </main>
  );
}
