"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { NavLink } from "./nav-links";

/**
 * תפריט המבורגר למובייל — מוצג רק מתחת ל-md (במקום הניווט הראשי שמוסתר במובייל).
 * נפתח כפאנל נשלף מתחת ל-Header וכולל את כל קישורי הניווט + קישור הדשבורד לצוות.
 */
export function MobileMenu({ links }: { links: NavLink[] }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // סגירה בלחיצה מחוץ לתפריט או ב-Escape
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

  const isStaff = user?.role === "staff" || user?.role === "admin";

  return (
    <div className="md:hidden relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="תפריט ניווט"
        className="w-10 h-10 -mr-2 flex items-center justify-center rounded-xl text-ink-500 hover:text-navy-600 hover:bg-sand-100 transition-colors"
      >
        {open ? (
          // X לסגירה
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          // שלושה קווים — המבורגר
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 bg-white rounded-2xl border border-sand-200 shadow-soft p-2 z-50"
        >
          {links.map((link) => (
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

          {isStaff && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-olive-700 hover:text-olive-600 hover:bg-sand-50 text-start transition-colors"
            >
              דשבורד צוות
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
