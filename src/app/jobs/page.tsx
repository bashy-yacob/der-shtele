// import { MOCK_JOBS } from '@/lib/mockData';
// import { FIELD_LABELS, REGION_LABELS, GENDER_LABELS, SITE_CONTENT } from '@/lib/constants';
// import { JobCard } from '@/components/jobs/JobCard';
// import type { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
//   title: 'לוח משרות',
// };

// // סינון לפי query params
// interface SearchParams {
//   field?: string;
//   region?: string;
//   gender?: string;
// }

// export default function JobsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }) {
//   const filtered = MOCK_JOBS.filter((job) => {
//     if (searchParams.field  && job.field  !== searchParams.field)  return false;
//     if (searchParams.region && job.region !== searchParams.region) return false;
//     if (searchParams.gender && job.gender !== searchParams.gender) return false;
//     return true;
//   });

//   return (
//     <main>
//       {/* Hero Section */}
//       <section className="bg-primary-50 py-12 px-4 border-b border-primary-200">
//         <div className="max-w-3xl mx-auto text-center">
//           <h1 className="text-4xl font-bold mb-3">{SITE_CONTENT.jobsPage.title}</h1>
//           <p className="text-xl text-neutral-600">{SITE_CONTENT.jobsPage.subtitle}</p>
//         </div>
//       </section>

//       <section className="max-w-5xl mx-auto px-4 py-16">
//         {/* Filters */}
//         <div className="mb-12">
//           <h2 className="text-lg font-bold mb-4">חפשו משרה</h2>
//           <form className="grid md:grid-cols-4 gap-4 items-end">
//             <FilterSelect
//               name="field"
//               label={SITE_CONTENT.jobsPage.filters.field}
//               options={FIELD_LABELS}
//               current={searchParams.field}
//             />
//             <FilterSelect
//               name="region"
//               label={SITE_CONTENT.jobsPage.filters.region}
//               options={REGION_LABELS}
//               current={searchParams.region}
//             />
//             <FilterSelect
//               name="gender"
//               label={SITE_CONTENT.jobsPage.filters.gender}
//               options={GENDER_LABELS}
//               current={searchParams.gender}
//             />
//             <div className="flex gap-2">
//               <button type="submit" className="btn-primary">
//                 חפשו
//               </button>
//               <Link href="/jobs" className="btn-outline">
//                 נקו
//               </Link>
//             </div>
//           </form>
//         </div>

//         {/* Results */}
//         {filtered.length === 0 ? (
//           <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
//             <p className="text-neutral-600 font-medium mb-4">{SITE_CONTENT.jobsPage.empty}</p>
//             <p className="text-neutral-500 mb-6">{SITE_CONTENT.jobsPage.emptyOffer}</p>
//             <Link href="/contact" className="btn-primary">
//               שלח קורות חיים
//             </Link>
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 gap-6">
//             {filtered.map((job) => (
//               <JobCard key={job.id} job={job} />
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

// // רכיב פנימי לפילטר
// function FilterSelect({
//   name,
//   label,
//   options,
//   current,
// }: {
//   name: string;
//   label: string;
//   options: Record<string, string>;
//   current?: string;
// }) {
//   return (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
//         {label}
//       </label>
//       <select
//         name={name}
//         id={name}
//         defaultValue={current ?? ''}
//         className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
//       >
//         <option value="">הכל</option>
//         {Object.entries(options).map(([value, labelText]) => (
//           <option key={value} value={value}>
//             {labelText}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
import { MOCK_JOBS } from '@/lib/mockData';
import { FIELD_LABELS, REGION_LABELS, GENDER_LABELS } from '@/lib/constants';
import { JobCard } from '@/components/jobs/JobCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'לוח משרות — דער שטעלע',
};

// ריכוז הטקסטים לעמוד המשרות
const JOBS_CONTENT = {
  title: "לוח משרות מעודכן",
  subtitle: "כאן תוכלו למצוא מגוון משרות איכותיות ומותאמות לצרכים הייחודיים של הציבור החרדי.",
  filters: {
    title: "חפשו משרה מתאימה",
    field: "תחום מקצועי",
    region: "אזור מגורים",
    gender: "התאמת משרה",
    searchButton: "חפשו",
    clearButton: "נקו פילטרים"
  },
  empty: {
    title: "לא נמצאו משרות התואמות את החיפוש שלך",
    desc: "אל דאגה, המשרות שלנו מתעדכנות מדי יום. אנו ממליצים לשלוח לנו קורות חיים כדי שנוכל לחפש עבורכם משרות דיסקרטיות שאינן מפורסמות בלוח.",
    button: "שלחו קורות חיים ונחפש עבורכם"
  }
};

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
    <main className="text-right bg-neutral-50/50 min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-transparent py-16 px-4 border-b border-neutral-200/50">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">
            {JOBS_CONTENT.title}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {JOBS_CONTENT.subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm mb-12">
          <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
            </svg>
            {JOBS_CONTENT.filters.title}
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <FilterSelect
              name="field"
              label={JOBS_CONTENT.filters.field}
              options={FIELD_LABELS}
              current={searchParams.field}
            />
            <FilterSelect
              name="region"
              label={JOBS_CONTENT.filters.region}
              options={REGION_LABELS}
              current={searchParams.region}
            />
            <FilterSelect
              name="gender"
              label={JOBS_CONTENT.filters.gender}
              options={GENDER_LABELS}
              current={searchParams.gender}
            />
            
            {/* כפתורי פעולה מותאמים אישית */}
            <div className="flex gap-2 w-full mt-2 sm:mt-0">
              <button 
                type="submit" 
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-primary-600/10 text-center"
              >
                {JOBS_CONTENT.filters.searchButton}
              </button>
              <Link 
                href="/jobs" 
                className="flex-1 border-2 border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-800 font-medium py-2 px-4 rounded-xl transition-all duration-200 text-center"
              >
                {JOBS_CONTENT.filters.clearButton}
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-3">
              {JOBS_CONTENT.empty.title}
            </h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed">
              {JOBS_CONTENT.empty.desc}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-md shadow-primary-600/10"
            >
              {JOBS_CONTENT.empty.button}
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

// רכיב פנימי לפילטר משופר ויזואלית
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
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-semibold text-neutral-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          defaultValue={current ?? ''}
          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 focus:bg-white transition-all appearance-none text-neutral-800 text-sm font-medium"
        >
          <option value="">הכל</option>
          {Object.entries(options).map(([value, labelText]) => (
            <option key={value} value={value}>
              {labelText}
            </option>
          ))}
        </select>
        {/* אייקון חץ מותאם אישית */}
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}