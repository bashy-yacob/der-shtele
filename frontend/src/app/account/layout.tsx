"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OptInReminder } from "@/components/account/OptInReminder";
import { cn } from "@/lib/utils";
import type { Icon } from "@/lib/icons";
import { UserCircle, FileText, Heart, Gear, SignOut } from "@/lib/icons";

const ACCOUNT_NAV: { href: string; label: string; icon: Icon }[] = [
  { href: "/account", label: "פרופיל", icon: UserCircle },
  { href: "/account/applications", label: "ההגשות שלי", icon: FileText },
  { href: "/account/saved", label: "משרות שמורות", icon: Heart },
  { href: "/account/settings", label: "הגדרות", icon: Gear },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // שער כניסה — מועמד לא מחובר מנותב להתחברות
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center text-ink-500">
        טוען...
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12" dir="rtl">
      <div className="grid md:grid-cols-4 gap-6 md:gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-wrap md:flex-col gap-1 bg-white rounded-2xl border border-sand-200 shadow-soft p-2">
            {ACCOUNT_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm transition-colors text-start whitespace-nowrap",
                    active
                      ? "bg-navy-50 text-navy-700 font-bold"
                      : "text-ink-500 font-semibold hover:text-navy-600 hover:bg-sand-50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-[1.15rem] h-[1.15rem] shrink-0",
                      active ? "text-navy-600" : "text-olive-500/90",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-start whitespace-nowrap transition-colors md:mt-1 md:border-t md:border-sand-200 md:rounded-t-none"
            >
              <SignOut className="w-[1.15rem] h-[1.15rem] shrink-0" />
              התנתקות
            </button>
          </nav>
        </aside>
        <section className="md:col-span-3 min-w-0">
          <OptInReminder />
          {children}
        </section>
      </div>
    </main>
  );
}
