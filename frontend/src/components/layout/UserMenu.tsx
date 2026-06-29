"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const MENU_LINKS = [
  { href: "/account", label: "הפרופיל שלי" },
  { href: "/account/applications", label: "ההגשות שלי" },
  { href: "/account/saved", label: "משרות שמורות" },
  { href: "/account/settings", label: "הגדרות" },
];

/** ראשי תיבות מהשם המלא (או אות ראשונה מהאימייל) לעיגול הפרופיל. */
function initials(fullName: string, email: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

/**
 * אזור המשתמש ב-Header: כפתורי כניסה/הרשמה כשלא מחובר,
 * ועיגול פרופיל עם תפריט נפתח כשמחובר.
 */
export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // סגירת התפריט בלחיצה מחוץ אליו או ב-Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // בזמן טעינת מצב ההתחברות — מציבים שומר מקום כדי למנוע קפיצת פריסה
  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-sand-200 animate-pulse" />;
  }

  // לא מחובר — כפתורי כניסה/הרשמה הקיימים
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden sm:inline text-sm font-semibold text-ink-500 hover:text-navy-600 transition-colors"
        >
          כניסה
        </Link>
        <Link
          href="/register"
          className="bg-navy-600 hover:bg-navy-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors duration-150 text-center"
        >
          הרשמה ←
        </Link>
      </div>
    );
  }

  // מחובר — עיגול פרופיל + תפריט
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="התפריט שלי"
        className="w-9 h-9 rounded-full bg-navy-600 text-white text-sm font-bold flex items-center justify-center ring-2 ring-olive-500 ring-offset-2 ring-offset-sand-50 hover:bg-navy-700 transition-colors"
      >
        {initials(user.fullName, user.email)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 bg-white rounded-2xl border border-sand-200 shadow-soft p-2 z-50"
        >
          {/* כותרת — שם ואימייל */}
          <div className="px-3 py-2 border-b border-sand-200 mb-1">
            <p className="text-sm font-bold text-ink-900 truncate">
              {user.fullName || "המשתמש שלי"}
            </p>
            <p className="text-xs text-ink-500 truncate">{user.email}</p>
          </div>

          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-ink-500 hover:text-navy-600 hover:bg-sand-50 text-start transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            role="menuitem"
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-start transition-colors"
          >
            התנתקות
          </button>
        </div>
      )}
    </div>
  );
}
