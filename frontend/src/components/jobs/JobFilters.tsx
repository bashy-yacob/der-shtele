import Link from "next/link";
import { FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { EXPERIENCE_OPTIONS } from "@/lib/labels";

interface JobFiltersProps {
  current: { field?: string; region?: string; experience?: string };
  /** ערים קיימות מהשרת — נמזגות עם ברירות-המחדל. */
  regions?: string[];
}

// אפשרויות ניסיון כ-Record (ערך=תווית) ל-Select הגנרי.
const EXPERIENCE_FILTER_OPTIONS = Object.fromEntries(
  EXPERIENCE_OPTIONS.map((e) => [e, e]),
);

/** טופס סינון משרות (GET — query params). */
export function JobFilters({ current, regions = [] }: JobFiltersProps) {
  // ערים כ-Record (ערך=תווית) כדי להתאים ל-Select הגנרי.
  const cityOptions = Object.fromEntries(
    buildCityOptions(regions).map((c) => [c, c]),
  );
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
      <Select
        name="field"
        label="תחום מקצועי"
        options={FIELD_LABELS}
        current={current.field}
      />
      <Select
        name="region"
        label="אזור מגורים"
        options={cityOptions}
        current={current.region}
      />
      <Select
        name="experience"
        label="ניסיון נדרש"
        options={EXPERIENCE_FILTER_OPTIONS}
        current={current.experience}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-navy-600 hover:bg-navy-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
        >
          חיפוש
        </button>
        <Link
          href="/jobs"
          className="flex-1 border border-sand-300 text-ink-700 hover:bg-sand-100 font-semibold py-2.5 px-4 rounded-xl text-center transition-colors"
        >
          ניקוי
        </Link>
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  options,
  current,
}: {
  name: string;
  label: string;
  options: Record<string, string>;
  current?: string;
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-ink-700 mb-2"
      >
        {label}
      </label>
      <select
        name={name}
        id={name}
        defaultValue={current ?? ""}
        className="w-full px-4 py-2.5 bg-white border border-sand-300 rounded-xl text-sm font-medium text-ink-900 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
      >
        <option value="">הכל</option>
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
