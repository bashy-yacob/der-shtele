import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/',        label: 'דף הבית' },
  { href: '/jobs',    label: 'לוח משרות' },
  { href: '/about',   label: 'אודות' },
  { href: '/contact', label: 'צור קשר' },
];

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* לוגו */}
        <Link href="/" className="text-xl font-bold text-primary-600">
          {SITE_NAME}
        </Link>

        {/* ניווט */}
        <nav className="flex gap-6 text-sm font-medium text-neutral-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
