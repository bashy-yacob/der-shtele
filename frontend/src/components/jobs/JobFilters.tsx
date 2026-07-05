"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { EXPERIENCE_OPTIONS } from "@/lib/labels";
import { buttonClass } from "@/components/ui/Button";
import { TagMultiSelect, type TagOption } from "@/components/ui/TagMultiSelect";
import { CaretDown } from "@/lib/icons";

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

  const fieldOptions: TagOption[] = useMemo(
    () =>
      Object.entries(FIELD_LABELS).map(([value, text]) => ({ value, text })),
    [],
  );

  // עיר מ-URL שאינה בברירות-המחדל עדיין תיכלל ברשימה (כדי שתופיע במגירה ובתגיות).
  const cityListOptions: TagOption[] = useMemo(() => {
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
