import { SITE_NAME, CONTACT_INFO } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="font-semibold text-white mb-1">{SITE_NAME}</p>
          <p>השמה מקצועית לציבור החרדי</p>
        </div>

        <div className="space-y-1">
          <p>טל׳: {CONTACT_INFO.phone}</p>
          <p>מייל: {CONTACT_INFO.email}</p>
          <p>שעות: {CONTACT_INFO.hours}</p>
        </div>

        <div className="text-neutral-500 self-end">
          <p>© {new Date().getFullYear()} {SITE_NAME}. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
