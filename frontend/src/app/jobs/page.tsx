import { getPublicJobs, getRegions } from "@/lib/api";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { Pagination } from "@/components/jobs/Pagination";
import { SendCvCta } from "@/components/jobs/SendCvCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "לוח משרות",
  description:
    "משרות פתוחות בכל הארץ לציבור החרדי — לוגיסטיקה, מנהלה, מכירות, חינוך, טכנולוגיה וחשבונאות. כל המשרות מועברות דרך הצוות, בדיסקרטיות מלאה.",
  alternates: { canonical: "/jobs" },
};

// הסינון מתבצע ב-backend לפי ה-query params; נטען טרי בכל בקשה.
export const dynamic = "force-dynamic";

const JOBS_CONTENT = {
  eyebrow: "לוח משרות",
  title: "משרות פתוחות",
  subtitle:
    "מגוון משרות איכותיות, מותאמות לצרכים של הציבור החרדי. כל המשרות מועברות דרך הצוות.",
  empty: {
    title: "לא נמצאו משרות התואמות את החיפוש",
    desc: "המשרות מתעדכנות באופן שוטף. הירשם ושלח קורות חיים — ונחפש עבורך גם משרות דיסקרטיות שאינן בלוח.",
    button: "הרשמה ושליחת קורות חיים ←",
  },
};

// כמות משרות לעמוד — מונע רינדור של עשרות כרטיסים בבת אחת (עומס DOM).
const PAGE_SIZE = 12;

interface SearchParams {
  field?: string | string[];
  region?: string | string[];
  experience?: string | string[];
  page?: string;
}

/** מנרמל פרמטר query לערך רב-בחירה אחיד ("a,b,c"). תומך גם ב-field=a&field=b. */
function csvParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.join(",") || undefined;
  return value || undefined;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const field = csvParam(searchParams.field);
  const region = csvParam(searchParams.region);
  const experience = csvParam(searchParams.experience);

  const [filtered, regions] = await Promise.all([
    getPublicJobs({ field, region, experience }),
    getRegions(),
  ]);

  // עימוד בצד שרת — מרנדרים רק את עמוד התוצאות הנוכחי. שומר על DOM קל.
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1),
    totalPages,
  );
  const pageJobs = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div dir="rtl">
      {/* כותרת הדף */}
      <section className="bg-sand-100 border-b border-sand-200 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            eyebrow={JOBS_CONTENT.eyebrow}
            title={JOBS_CONTENT.title}
            subtitle={JOBS_CONTENT.subtitle}
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* כרטיס סינון */}
        <div className="bg-white rounded-2xl border border-sand-200 shadow-soft p-6 sm:p-8 mb-12">
          <h2 className="font-display text-ink-900 text-lg font-bold mb-6">
            חיפוש משרה מתאימה
          </h2>
          <JobFilters
            current={{ field, region, experience }}
            regions={regions}
          />
        </div>

        {/* תוצאות */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-sand-300 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-soft">
            <h3 className="font-display text-ink-900 text-xl font-bold mb-3">
              {JOBS_CONTENT.empty.title}
            </h3>
            <p className="text-ink-700 mb-8 max-w-md mx-auto leading-relaxed">
              {JOBS_CONTENT.empty.desc}
            </p>
            <SendCvCta label={JOBS_CONTENT.empty.button} />
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-500 mb-6">
              {total} משרות פתוחות
              {totalPages > 1
                ? ` · עמוד ${currentPage} מתוך ${totalPages}`
                : ""}
            </p>
            <JobList jobs={pageJobs} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              params={{ field, region, experience }}
            />
          </>
        )}
      </section>
    </div>
  );
}
