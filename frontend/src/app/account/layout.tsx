'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const ACCOUNT_NAV = [
  { href: '/account', label: 'פרופיל' },
  { href: '/account/applications', label: 'ההגשות שלי' },
  { href: '/account/saved', label: 'משרות שמורות' },
  { href: '/account/settings', label: 'הגדרות' },
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
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center text-neutral-500">
        טוען...
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12" dir="rtl">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex md:flex-col gap-1">
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-right transition-colors"
            >
              התנתקות
            </button>
          </nav>
        </aside>
        <section className="md:col-span-3">{children}</section>
      </div>
    </main>
  );
}
