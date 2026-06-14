import Link from 'next/link';
import { FIELD_LABELS, REGION_LABELS, GENDER_LABELS } from '@/lib/constants';

interface JobFiltersProps {
  current: { field?: string; region?: string; gender?: string };
}

/** טופס סינון משרות (GET — query params). */
export function JobFilters({ current }: JobFiltersProps) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
      <Select name="field" label="תחום מקצועי" options={FIELD_LABELS} current={current.field} />
      <Select name="region" label="אזור מגורים" options={REGION_LABELS} current={current.region} />
      <Select name="gender" label="התאמת משרה" options={GENDER_LABELS} current={current.gender} />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
        >
          חיפוש
        </button>
        <Link
          href="/jobs"
          className="flex-1 border-2 border-neutral-200 text-neutral-600 font-medium py-2 px-4 rounded-xl text-center transition-colors"
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
      <label htmlFor={name} className="block text-sm font-semibold text-neutral-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        id={name}
        defaultValue={current ?? ''}
        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 focus:outline-none"
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
