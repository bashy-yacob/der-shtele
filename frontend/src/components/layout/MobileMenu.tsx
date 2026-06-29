"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { List, X, SquaresFour } from "@/lib/icons";
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
          <X size={22} weight="bold" aria-hidden="true" />
        ) : (
          <List size={22} weight="bold" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 bg-white rounded-2xl border border-sand-200 shadow-soft p-2 z-50"
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink-500 hover:text-navy-600 hover:bg-sand-50 text-start transition-colors"
              >
                <Icon className="w-5 h-5 text-olive-500/90 shrink-0" />
                {link.label}
              </Link>
            );
          })}

          {isStaff && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-olive-700 hover:text-olive-600 hover:bg-sand-50 text-start transition-colors"
            >
              <SquaresFour className="w-5 h-5 shrink-0" />
              דשבורד צוות
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
