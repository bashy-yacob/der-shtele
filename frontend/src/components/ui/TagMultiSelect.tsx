"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, Check, X } from "@/lib/icons";

export interface TagOption {
  value: string;
  text: string;
}

/**
 * שדה רב-בחירה בסגנון תגיות + מגירה. הנבחרים מוצגים כתגיות ניתנות-להסרה בתוך
 * השדה; לחיצה פותחת רשימת סימון. `searchable` מוסיף שדה חיפוש פנימי לסינון הרשימה.
 * משותף ללוח המשרות (JobFilters) ולטופס הפרופיל.
 */
export function TagMultiSelect({
  label,
  placeholder,
  options,
  selected,
  onToggle,
  searchable = false,
  searchPlaceholder = "הקלד לחיפוש…",
  emptyText = "לא נמצאה תוצאה",
}: {
  label: string;
  placeholder: string;
  options: TagOption[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // סגירה בלחיצה בחוץ או ב-Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // מיקוד בשדה החיפוש עם הפתיחה.
  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
    if (!open) setSearch("");
  }, [open, searchable]);

  const textFor = (value: string) =>
    options.find((o) => o.value === value)?.text ?? value;

  const visibleOptions = useMemo(() => {
    const q = search.trim();
    const list = q ? options.filter((o) => o.text.includes(q)) : options;
    // הנבחרים תמיד למעלה — כדי שלא "ייעלמו" בעת חיפוש.
    return [...list].sort(
      (a, b) =>
        Number(selected.includes(b.value)) - Number(selected.includes(a.value)),
    );
  }, [options, search, selected]);

  return (
    <div ref={containerRef}>
      <label className="mb-2 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        {/* השדה — מכיל את התגיות והפלייסהולדר/חיפוש */}
        <div
          onClick={() => setOpen((v) => !v)}
          className={
            "flex min-h-[46px] w-full cursor-text flex-wrap items-center gap-1.5 border bg-white px-2.5 py-2 transition-colors " +
            (open
              ? "rounded-t-xl border-navy-600 ring-2 ring-navy-600/20"
              : "rounded-xl border-sand-300 hover:border-navy-400")
          }
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
        >
          {selected.map((value) => (
            <Tag
              key={value}
              text={textFor(value)}
              onRemove={(e) => {
                e.stopPropagation();
                onToggle(value);
              }}
            />
          ))}

          {searchable && open ? (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={searchPlaceholder}
              dir="rtl"
              className="min-w-[90px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          ) : (
            <span className="px-1 text-sm text-ink-400">{placeholder}</span>
          )}

          <CaretDown
            weight="bold"
            aria-hidden
            className={
              "mr-auto h-4 w-4 shrink-0 text-ink-400 transition-transform " +
              (open ? "rotate-180" : "")
            }
          />
        </div>

        {/* המגירה — רשימת סימון */}
        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            className="absolute inset-x-0 top-full z-20 max-h-60 overflow-y-auto rounded-b-xl border border-t-0 border-navy-600 bg-white py-1 shadow-lift"
          >
            {visibleOptions.map((o) => {
              const isSelected = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(o.value)}
                  className={
                    "flex w-full items-center gap-3 px-4 py-2.5 text-right text-sm transition-colors " +
                    (isSelected ? "bg-navy-50" : "hover:bg-sand-50")
                  }
                >
                  <span
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md " +
                      (isSelected
                        ? "bg-navy-600 text-white"
                        : "border-2 border-sand-300")
                    }
                  >
                    {isSelected && (
                      <Check
                        weight="bold"
                        aria-hidden
                        className="h-3.5 w-3.5"
                      />
                    )}
                  </span>
                  <span
                    className={
                      isSelected
                        ? "font-semibold text-navy-700"
                        : "text-ink-700"
                    }
                  >
                    {o.text}
                  </span>
                </button>
              );
            })}
            {visibleOptions.length === 0 && (
              <p className="px-4 py-3 text-sm text-ink-400">{emptyText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** תגית נבחר עם כפתור הסרה (×) — navy מלא. */
function Tag({
  text,
  onRemove,
}: {
  text: string;
  onRemove: (e: React.MouseEvent) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-navy-600 py-1 pr-2.5 pl-1.5 text-xs font-semibold text-white">
      {text}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`הסר ${text}`}
        className="flex h-4 w-4 items-center justify-center rounded opacity-80 transition hover:bg-white/20 hover:opacity-100"
      >
        <X weight="bold" aria-hidden className="h-3 w-3" />
      </button>
    </span>
  );
}
