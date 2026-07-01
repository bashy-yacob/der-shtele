"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Icon } from "@/lib/icons";
import {
  SquaresFour,
  ChatCircleText,
  Users,
  Briefcase,
  Buildings,
  Receipt,
  BellRinging,
  EnvelopeSimple,
  Quotes,
  Megaphone,
  SignOut,
} from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useDueReminders } from "@/hooks/useDueReminders";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

// ניווט הדשבורד — לפי סעיף 7 באיפיון.
const ADMIN_NAV: {
  href: string;
  label: string;
  icon: Icon;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "לוח בקרה", icon: SquaresFour, exact: true },
  { href: "/admin/contacts", label: "פניות", icon: ChatCircleText },
  { href: "/admin/candidates", label: "מועמדים", icon: Users },
  { href: "/admin/jobs", label: "משרות", icon: Briefcase },
  { href: "/admin/employers", label: "מעסיקים", icon: Buildings },
  { href: "/admin/commissions", label: "עמלות", icon: Receipt },
  { href: "/admin/reminders", label: "תזכורות", icon: BellRinging },
  { href: "/admin/mailing", label: "רשימת תפוצה", icon: EnvelopeSimple },
  { href: "/admin/testimonials", label: "המלצות", icon: Quotes },
  { href: "/admin/advertisements", label: "פרסומות", icon: Megaphone },
];

const ADMIN_ROLES = ["staff", "admin"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const authorized = !!user && ADMIN_ROLES.includes(user.role);
  // המונה לתג בניווט; הבאנר עצמו גלובלי (ב-RootLayout) ומופיע בכל עמוד.
  const { dueCount } = useDueReminders(authorized);

  // שער כניסה — רק צוות פנימי (staff/admin). אחרים מנותבים.
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!authorized) router.replace("/");
  }, [loading, user, authorized, router]);

  if (loading || !user) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center text-ink-500">
        טוען...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center text-ink-500">
        אזור זה מיועד לצוות הסוכנות בלבד.
      </main>
    );
  }

  return (
    <ConfirmProvider>
      <main className="max-w-[1400px] mx-auto px-4 py-8" dir="rtl">
        <div className="grid md:grid-cols-5 gap-6">
          <aside className="md:col-span-1">
            <div className="sticky top-4">
              <div className="mb-3 px-2">
                <p className="text-xs text-ink-400">מחובר כ-</p>
                <p className="text-sm font-bold text-ink-900 truncate">
                  {user.fullName || user.email}
                </p>
              </div>
              <nav className="flex md:flex-col gap-1 bg-white rounded-2xl border border-sand-200 shadow-soft p-2 flex-wrap">
                {ADMIN_NAV.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const isReminders = item.href === "/admin/reminders";
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors text-start",
                        active
                          ? "bg-navy-50 text-navy-700 font-bold"
                          : "text-ink-500 font-semibold hover:text-navy-600 hover:bg-sand-50",
                      )}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "w-[1.15rem] h-[1.15rem] shrink-0",
                            active ? "text-navy-600" : "text-olive-500/90",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {isReminders && dueCount > 0 && (
                        <span className="ms-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                          {dueCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-start transition-colors"
                >
                  <SignOut className="w-[1.15rem] h-[1.15rem] shrink-0" />
                  התנתקות
                </button>
              </nav>
            </div>
          </aside>
          <section className="md:col-span-4 min-w-0">{children}</section>
        </div>
      </main>
    </ConfirmProvider>
  );
}
