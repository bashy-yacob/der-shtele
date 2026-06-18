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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link
          href="/jobs"
          className="text-navy-600 font-medium mb-8 inline-block hover:underline"
        >
          ← חזרה לכל המשרות
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Job Details */}
          <section className="md:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="font-display text-4xl font-bold text-ink-900 mb-2">
                    {job.title}
                  </h1>
                  <p className="text-ink-500 font-medium">
                    {companyLabel} ·{" "}
                    {new Date(job.createdAt).toLocaleDateString("he-IL")} ·
                    פורסם
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Tag label="תחום" value={FIELD_LABELS[job.field]} />
                <Tag label="אזור" value={regionLabel(job.region)} />
                <Tag label="היקף" value={job.scope} />
                {job.experience && (
                  <Tag label="ניסיון נדרש" value={job.experience} />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-8">
              <h2 className="font-display text-2xl font-bold text-ink-900 mb-4">
                אודות המשרה
              </h2>
              <p className="text-ink-700 leading-relaxed">{job.description}</p>

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

            {/* Privacy Note */}
            <div className="bg-olive-50 border border-olive-100 rounded-xl p-4 mt-8">
              <p className="text-sm text-olive-700">
                <span className="font-bold">פרטי המעסיק:</span> פרטי המעסיק
                חסויים לחלוטין במסך הציבורי. פרטים אלו יועברו אליך רק לאחר שיחה
                עם הצוות שלנו והסכמת המעסיק.
              </p>
            </div>
          </section>

          {/* Application Form - Sticky Sidebar */}
          <section className="md:col-span-1">
            <div className="md:sticky md:top-4 space-y-4">
              <SaveJobButton jobId={job.id} variant="full" />
              <ApplicationForm jobId={job.id} jobTitle={job.title} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <span className="bg-sand-50 text-ink-700 border border-sand-200 px-3 py-2 rounded-xl text-sm font-medium">
      <span className="text-ink-500 text-xs">{label}:</span> {value}
    </span>
  );
}
