"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { EXPERIENCE_OPTIONS } from "@/lib/labels";
import { buttonClass } from "@/components/ui/Button";

interface JobFiltersProps {
  /** הפילטרים הפעילים מה-URL. תחום/אזור עשויים להיות רב-ערכיים ("a,b,c"). */
  current: { field?: string; region?: string; experience?: string };
  /** ערים קיימות מהשרת — נמזגות עם ברירות-המחדל. */
  regions?: string[];
}

/** מפצל ערך query רב-בחירה ("a,b,c") לרשימה מנוקה. */
function splitCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * טופס סינון משרות — רב-בחירה לתחום ולאזור (צ'יפים), בחירה יחידה לניסיון.
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
  const [citySearch, setCitySearch] = useState("");

  // בחירה יחידה שלא ברשימה (עיר מ-URL שאינה בברירות-המחדל) עדיין תוצג כצ'יפ פעיל.
  const allCities = useMemo(() => {
    const set = new Set<string>(cityOptions);
    for (const c of cities) set.add(c);
    return Array.from(set);
  }, [cityOptions, cities]);

  const visibleCities = useMemo(() => {
    const q = citySearch.trim();
    const list = q ? allCities.filter((c) => c.includes(q)) : allCities;
    // הערים שנבחרו תמיד למעלה, כדי שלא "ייעלמו" בעת חיפוש.
    return [...list].sort(
      (a, b) => Number(cities.includes(b)) - Number(cities.includes(a)),
    );
  }, [allCities, citySearch, cities]);

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
    setCitySearch("");
    router.push("/jobs");
  };

  const selectedCount = fields.length + cities.length + (experience ? 1 : 0);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* תחום מקצועי — רב-בחירה */}
      <ChipGroup
        label="תחום מקצועי"
        hint="ניתן לבחור כמה תחומים"
        options={Object.entries(FIELD_LABELS).map(([value, text]) => ({
          value,
          text,
        }))}
        selected={fields}
        onToggle={(v) => toggle(fields, setFields, v)}
      />

      {/* אזור מגורים — רב-בחירה עם חיפוש חופשי */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor="city-search"
            className="block text-sm font-semibold text-ink-700"
          >
            אזור מגורים
          </label>
          <span className="text-xs text-ink-400">ניתן לבחור כמה ערים</span>
        </div>
        <input
          id="city-search"
          type="text"
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          placeholder="חיפוש עיר…"
          dir="rtl"
          className="w-full mb-3 px-4 py-2.5 bg-white border border-sand-300 rounded-xl text-sm font-medium text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
        />
        <div className="flex flex-wrap gap-2">
          {visibleCities.map((c) => (
            <Chip
              key={c}
              text={c}
              active={cities.includes(c)}
              onClick={() => toggle(cities, setCities, c)}
            />
          ))}
          {visibleCities.length === 0 && (
            <p className="text-sm text-ink-400 py-1">לא נמצאה עיר תואמת</p>
          )}
        </div>
      </div>

      {/* ניסיון נדרש — בחירה יחידה */}
      <div className="max-w-xs">
        <label
          htmlFor="experience"
          className="block text-sm font-semibold text-ink-700 mb-2"
        >
          ניסיון נדרש
        </label>
        <select
          name="experience"
          id="experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-sand-300 rounded-xl text-sm font-medium text-ink-900 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
        >
          <option value="">הכל</option>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

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

/** קבוצת צ'יפים לבחירה מרובה עם תווית וכיתוב עזר. */
function ChipGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string;
  hint?: string;
  options: { value: string; text: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="block text-sm font-semibold text-ink-700">
          {label}
        </span>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.value}
            text={o.text}
            active={selected.includes(o.value)}
            onClick={() => onToggle(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

/** צ'יפ בורר בודד (toggle). מסומן = navy מלא; לא מסומן = מתאר עדין. */
function Chip({
  text,
  active,
  onClick,
}: {
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors " +
        (active
          ? "bg-navy-600 border-navy-600 text-white"
          : "bg-white border-sand-300 text-ink-700 hover:border-navy-400 hover:text-navy-700")
      }
    >
      {text}
    </button>
  );
}
