import { MOCK_JOBS } from '@/lib/mockData';
import { FIELD_LABELS, REGION_LABELS, GENDER_LABELS, SITE_CONTENT } from '@/lib/constants';
import { JobCard } from '@/components/jobs/JobCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'לוח משרות',
};

// סינון לפי query params
interface SearchParams {
  field?: string;
  region?: string;
  gender?: string;
}

export default function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filtered = MOCK_JOBS.filter((job) => {
    if (searchParams.field  && job.field  !== searchParams.field)  return false;
    if (searchParams.region && job.region !== searchParams.region) return false;
    if (searchParams.gender && job.gender !== searchParams.gender) return false;
    return true;
  });

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-primary-50 py-12 px-4 border-b border-primary-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">{SITE_CONTENT.jobsPage.title}</h1>
          <p className="text-xl text-neutral-600">{SITE_CONTENT.jobsPage.subtitle}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        {/* Filters */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4">חפשו משרה</h2>
          <form className="grid md:grid-cols-4 gap-4 items-end">
            <FilterSelect
              name="field"
              label={SITE_CONTENT.jobsPage.filters.field}
              options={FIELD_LABELS}
              current={searchParams.field}
            />
            <FilterSelect
              name="region"
              label={SITE_CONTENT.jobsPage.filters.region}
              options={REGION_LABELS}
              current={searchParams.region}
            />
            <FilterSelect
              name="gender"
              label={SITE_CONTENT.jobsPage.filters.gender}
              options={GENDER_LABELS}
              current={searchParams.gender}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                חפשו
              </button>
              <Link href="/jobs" className="btn-outline">
                נקו
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
            <p className="text-neutral-600 font-medium mb-4">{SITE_CONTENT.jobsPage.empty}</p>
            <p className="text-neutral-500 mb-6">{SITE_CONTENT.jobsPage.emptyOffer}</p>
            <Link href="/contact" className="btn-primary">
              שלח קורות חיים
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// רכיב פנימי לפילטר
function FilterSelect({
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
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        id={name}
        defaultValue={current ?? ''}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
      >
        <option value="">הכל</option>
        {Object.entries(options).map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}
