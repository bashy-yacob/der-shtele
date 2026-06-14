// import Link from 'next/link';
// import { SITE_NAME } from '@/lib/constants';

// const NAV_LINKS = [
//   { href: '/',        label: 'דף הבית' },
//   { href: '/jobs',    label: 'לוח משרות' },
//   { href: '/about',   label: 'אודות' },
//   { href: '/contact', label: 'צור קשר' },
// ];

// export function Header() {
//   return (
//     <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
//       <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
//         {/* לוגו */}
//         <Link href="/" className="text-xl font-bold text-primary-600">
//           {SITE_NAME}
//         </Link>

//         {/* ניווט */}
//         <nav className="flex gap-6 text-sm font-medium text-neutral-700">
//           {NAV_LINKS.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               className="hover:text-primary-600 transition-colors"
//             >
//               {link.label}
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </header>
//   );
// }
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
    <header 
      className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-50 shadow-[0_2px_15px_rgba(0,0,0,0.02)]" 
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ימין: לוגו וניווט */}
        <div className="flex items-center gap-8">
          {/* לוגו מותגי מעוצב */}
          <Link href="/" className="flex items-center gap-1 text-xl font-extrabold text-neutral-900 tracking-tight">
            <span className="text-primary-600">דער</span>
            <span>שטעלע</span>
            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full shrink-0" />
          </Link>

          {/* ניווט ראשי - מוסתר בניידים למניעת עומס */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-500">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-neutral-900 transition-colors py-1.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* שמאל: כניסה + כפתור הנעה לפעולה מהיר (CTA) */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            כניסה
          </Link>
          <Link
            href="/contact"
            className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-primary-600/10 text-center"
          >
            שליחת קו״ח מהירה ←
          </Link>
        </div>

      </div>
    </header>
  );
}