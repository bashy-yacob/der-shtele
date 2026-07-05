"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { EXPERIENCE_OPTIONS } from "@/lib/labels";
import { buttonClass } from "@/components/ui/Button";
import { CaretDown, Check, X } from "@/lib/icons";

interface JobFiltersProps {
  /** הפילטרים הפעילים מה-URL. תחום/אזור עשויים להיות רב-ערכיים ("a,b,c"). */
  current: { field?: string; region?: string; experience?: string };
  /** ערים קיימות מהשרת — נמזגות עם ברירות-המחדל. */
  regions?: string[];
}

interface Option {
  value: string;
  text: string;
}

/** מפצל ערך query רב-בחירה ("a,b,c") לרשימה מנוקה. */
function splitCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * טופס סינון משרות — וריאציה 2: כל מסנן נראה כשדה-קלט. הנבחרים מופיעים בתוכו
 * כתגיות ניתנות-להסרה (×), ולחיצה פותחת מגירת סימון (עם חיפוש לאזור).
 * בשליחה נבנה query בפורמט `field=a,b,c` והדף נטען מחדש בצד שרת.
 */
export function JobFilters({ current, regions = [] }: JobFiltersProps) {
  const router = useRouter();
  const cityOptions = useMemo(() => buildCityOptions(regions), [regions]);

  const [fields, setFields] = useState<string[]>(() => splitCsv(current.field));
  const [cities, setCities] = useState<string[]>(() =>
    splitCsv(current.region),
  );
  const [experience, setExperience] = useState<string>(
    current.experience ?? "",
  );

  const fieldOptions: Option[] = useMemo(
    () =>
      Object.entries(FIELD_LABELS).map(([value, text]) => ({ value, text })),
    [],
  );

  // עיר מ-URL שאינה בברירות-המחדל עדיין תיכלל ברשימה (כדי שתופיע במגירה ובתגיות).
  const cityListOptions: Option[] = useMemo(() => {
    const set = new Set<string>(cityOptions);
    for (const c of cities) set.add(c);
    return Array.from(set).map((c) => ({ value: c, text: c }));
  }, [cityOptions, cities]);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (fields.length) sp.set("field", fields.join(","));
    if (cities.length) sp.set("region", cities.join(","));
    if (experience) sp.set("experience", experience);
    const qs = sp.toString();
    // חיפוש חדש — חוזרים לעמוד הראשון (משמיטים את ?page).
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  };

  const onClear = () => {
    setFields([]);
    setCities([]);
    setExperience("");
    router.push("/jobs");
  };

  const selectedCount = fields.length + cities.length + (experience ? 1 : 0);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* תחום מקצועי — רב-בחירה */}
        <TagMultiSelect
          label="תחום מקצועי"
          placeholder="הוסף תחום…"
          options={fieldOptions}
          selected={fields}
          onToggle={(v) => toggle(fields, setFields, v)}
        />

        {/* ניסיון נדרש — בחירה יחידה */}
        <div>
          <label
            htmlFor="experience"
            className="mb-2 block text-sm font-semibold text-ink-700"
          >
            ניסיון נדרש
          </label>
          <div className="relative">
            <select
              name="experience"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="min-h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-sand-300 bg-white py-2 pr-4 pl-10 text-sm font-medium text-ink-900 transition-colors hover:border-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
            >
              <option value="">הכל</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <CaretDown
              weight="bold"
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            />
          </div>
        </div>
      </div>

      {/* אזור מגורים — רב-בחירה עם חיפוש חופשי */}
      <TagMultiSelect
        label="אזור מגורים"
        placeholder="הוסף עיר…"
        searchable
        searchPlaceholder="הקלד לחיפוש עיר…"
        emptyText="לא נמצאה עיר תואמת"
        options={cityListOptions}
        selected={cities}
        onToggle={(v) => toggle(cities, setCities, v)}
      />

      <div className="flex gap-2 pt-1">
        <button type="submit" className={buttonClass("primary", "md")}>
          חיפוש
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={selectedCount === 0}
          className={buttonClass("outline", "md")}
        >
          ניקוי
        </button>
      </div>
    </form>
  );
}

/**
 * שדה רב-בחירה בסגנון תגיות + מגירה. הנבחרים מוצגים כתגיות ניתנות-להסרה בתוך
 * השדה; לחיצה פותחת רשימת סימון. `searchable` מוסיף שדה חיפוש פנימי לסינון הרשימה.
 */
function TagMultiSelect({
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
  options: Option[];
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
        {/* השדה — מכל התגיות והפלייסהולדר/חיפוש */}
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
