import { getPublicJobs, getRegions } from "@/lib/api";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import type { JobField, Region } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";

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
    desc: "המשרות מתעדכנות באופן שוטף. הירשמו ושלחו קורות חיים — ונחפש עבורכם גם משרות דיסקרטיות שאינן בלוח.",
    button: "הרשמה ושליחת קורות חיים ←",
  },
};

interface SearchParams {
  field?: string;
  region?: string;
  experience?: string;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [filtered, regions] = await Promise.all([
    getPublicJobs({
      field: searchParams.field as JobField | undefined,
      region: searchParams.region as Region | undefined,
      experience: searchParams.experience,
    }),
    getRegions(),
  ]);

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
          <JobFilters current={searchParams} regions={regions} />
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
            <Link href="/register" className={buttonClass("primary", "lg")}>
              {JOBS_CONTENT.empty.button}
            </Link>
          </div>
        ) : (
          <JobList jobs={filtered} />
        )}
      </section>
    </div>
  );
}
