import { notFound } from 'next/navigation';
import { MOCK_JOBS } from '@/lib/mockData';
import { FIELD_LABELS, REGION_LABELS, GENDER_LABELS } from '@/lib/constants';
import type { Metadata } from 'next';
import Link from 'next/link';
import ApplicationForm from '@/components/forms/ApplicationForm';

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const job = MOCK_JOBS.find((j) => j.id === params.id);
  return { title: job?.title ?? 'משרה' };
}

export default function JobPage({ params }: Props) {
  const job = MOCK_JOBS.find((j) => j.id === params.id);
  if (!job) notFound();

  // Anonymize company name
  const companyLabel = `ארגון ב${REGION_LABELS[job.region]}`;

  return (
    <main>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/jobs" className="text-primary-600 font-medium mb-8 inline-block hover:underline">
          ← חזרה לכל המשרות
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Job Details */}
          <section className="md:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-primary-600 mb-2">{job.title}</h1>
                  <p className="text-neutral-600 font-medium">
                    {companyLabel} · {new Date(job.createdAt).toLocaleDateString('he-IL')} · פורסם
                  </p>
                </div>
                {job.rabbinicalApproval && (
                  <div className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg whitespace-nowrap font-medium">
                    ✓ משרה זו עברה אישור רבני
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Tag label="תחום" value={FIELD_LABELS[job.field]} />
                <Tag label="אזור" value={REGION_LABELS[job.region]} />
                <Tag label="היקף" value={job.scope} />
                <Tag label="מגדר" value={GENDER_LABELS[job.gender]} />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">אודות המשרה</h2>
              <p className="text-neutral-700 leading-relaxed">{job.description}</p>

              <h3 className="text-lg font-bold mt-8 mb-3">דרישות</h3>
              <ul className="list-disc list-inside text-neutral-700 space-y-2 text-sm">
                <li>ניסיון קודם בתחום הרלוונטי</li>
                <li>יכולות תקשורת טובות</li>
                <li>זמינות למשרה בהיקף הנדרש</li>
              </ul>

              <h3 className="text-lg font-bold mt-8 mb-3">מה אנחנו מציעים</h3>
              <ul className="list-disc list-inside text-neutral-700 space-y-2 text-sm">
                <li>משכורת תחרותית</li>
                <li>סביבת עבודה נעימה ותומכת</li>
                <li>הזדמנויות for פיתוח מקצועי</li>
              </ul>
            </div>

            {/* Privacy Note */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-8">
              <p className="text-sm text-primary-900">
                <span className="font-bold">פרטי המעסיק:</span> פרטי המעסיק חסויים לחלוטין במסך הציבורי. פרטים אלו יועברו אליך רק לאחר שיחה עם הצוות שלנו והסכמת המעסיק.
              </p>
            </div>
          </section>

          {/* Application Form - Sticky Sidebar */}
          <section className="md:col-span-1">
            <div className="md:sticky md:top-4">
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
    <span className="bg-neutral-100 text-neutral-700 px-3 py-2 rounded-md text-sm font-medium">
      <span className="text-neutral-500 text-xs">{label}:</span> {value}
    </span>
  );
}
