import { notFound } from "next/navigation";
import { getPublicJob } from "@/lib/api";
import {
  FIELD_LABELS,
  regionLabel,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";
import type { Icon } from "@/lib/icons";
import {
  Briefcase,
  MapPin,
  Clock,
  ChartLineUp,
  Buildings,
  ShieldCheck,
} from "@/lib/icons";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getPublicJob(params.id);
  if (!job) return { title: "משרה" };
  return {
    title: job.title,
    description: job.description.slice(0, 160),
    alternates: { canonical: `/jobs/${job.id}` },
  };
}

// scope חופשי ('מלאה' | 'חלקית' | 'גמיש') → ערך employmentType תקני של schema.org
function employmentType(scope: string): string {
  if (scope.includes("מלא")) return "FULL_TIME";
  if (scope.includes("חלק")) return "PART_TIME";
  return "OTHER";
}

export default async function JobPage({ params }: Props) {
  const job = await getPublicJob(params.id);
  if (!job) notFound();

  // Anonymize company name
  const companyLabel = `ארגון ב${regionLabel(job.region)}`;

  // עובדות-מהירות לרצועת ה-hero (התחום מוצג כתגית נפרדת מעל).
  const facts: { icon: Icon; label: string; value: string }[] = [
    { icon: MapPin, label: "אזור", value: regionLabel(job.region) },
    { icon: Clock, label: "היקף", value: job.scope },
    ...(job.experience
      ? [{ icon: ChartLineUp, label: "ניסיון", value: job.experience }]
      : []),
  ];

  // Structured data — מאפשר הופעה ב"גוגל למשרות" (Google Jobs).
  // המעסיק האמיתי חסוי; הסוכנות עצמה רשומה כ-hiringOrganization (היא המפרסמת).
  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: new Date(job.createdAt).toISOString(),
    employmentType: employmentType(job.scope),
    industry: FIELD_LABELS[job.field],
    ...(job.experience ? { experienceRequirements: job.experience } : {}),
    url: `${SITE_URL}/jobs/${job.id}`,
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: regionLabel(job.region),
        addressCountry: "IL",
      },
    },
    applicantLocationRequirements: { "@type": "Country", name: "ישראל" },
  };

  return (
    <main className="bg-sand-100 min-h-screen">
      <script
        type="application/ld+json"
        // escape של < מונע "בריחה" מתגית ה-script (למשל </script> בכותרת משרה)
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobPostingLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/jobs"
          className="text-navy-600 font-medium mb-4 inline-block hover:underline"
        >
          ← חזרה לכל המשרות
        </Link>

        {/* Hero header — כותרת + תגית תחום + עובדות-מהירות */}
        <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-6 sm:p-8 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-olive-100 text-olive-700 rounded-full px-3 py-1 text-xs font-bold mb-3">
            <Briefcase className="w-3.5 h-3.5" weight="bold" />
            {FIELD_LABELS[job.field]}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">
            {job.title}
          </h1>
          <p className="text-ink-500 font-medium mt-2 inline-flex items-center gap-1.5">
            <Buildings className="w-4 h-4 text-ink-400" />
            {companyLabel} · פורסם{" "}
            {new Date(job.createdAt).toLocaleDateString("he-IL")}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6 pt-6 border-t border-sand-200">
            {facts.map(({ icon: FactIcon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy-50 text-navy-600 shrink-0">
                  <FactIcon className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-[11px] text-ink-400">{label}</div>
                  <div className="text-sm font-bold text-ink-900">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* גוף — תוכן + טופס הגשה בסרגל צד דביק */}
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
                אודות המשרה
              </h2>
              <p className="text-ink-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              <h3 className="font-display text-lg font-bold text-ink-900 mt-8 mb-3">
                דרישות
              </h3>
              <ul className="list-disc list-inside text-ink-700 space-y-2 text-sm">
                <li>
                  {job.experience
                    ? `ניסיון נדרש: ${job.experience}`
                    : "ניסיון קודם בתחום הרלוונטי"}
                </li>
                <li>יכולות תקשורת טובות</li>
                <li>זמינות למשרה בהיקף הנדרש</li>
              </ul>

              <h3 className="font-display text-lg font-bold text-ink-900 mt-8 mb-3">
                מה אנחנו מציעים
              </h3>
              <ul className="list-disc list-inside text-ink-700 space-y-2 text-sm">
                <li>משכורת תחרותית</li>
                <li>סביבת עבודה נעימה ותומכת</li>
                <li>הזדמנויות לפיתוח מקצועי</li>
              </ul>
            </div>

            <div className="bg-olive-50 border border-olive-100 rounded-xl p-4 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-olive-600 shrink-0 mt-0.5" />
              <p className="text-sm text-olive-700">
                <span className="font-bold">פרטי המעסיק חסויים.</span> הם יימסרו
                אליך רק לאחר שיחה עם הצוות שלנו והסכמת המעסיק.
              </p>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-4">
              <SaveJobButton jobId={job.id} variant="full" />
              <ApplicationForm jobId={job.id} jobTitle={job.title} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
