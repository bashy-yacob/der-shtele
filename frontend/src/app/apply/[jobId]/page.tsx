import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicJob } from '@/lib/api';
import ApplicationForm from '@/components/forms/ApplicationForm';

interface Props {
  params: { jobId: string };
}

export const metadata: Metadata = { title: 'הגשת מועמדות' };

export default async function ApplyPage({ params }: Props) {
  // נטען מה-backend האמיתי בלבד. אם המשרה לא נמצאה / השרת לא זמין — מציגים
  // הודעה ברורה, ולא טופס למשרה שלא קיימת (אין יותר נפילה ל-mock).
  const job = await getPublicJob(params.jobId);

  return (
    <main className="max-w-2xl mx-auto px-4 py-16" dir="rtl">
      <Link
        href="/jobs"
        className="text-primary-600 font-medium mb-8 inline-block hover:underline"
      >
        ← חזרה ללוח המשרות
      </Link>

      <h1 className="text-3xl font-bold text-neutral-900 mb-2">הגשת מועמדות</h1>

      {job ? (
        <>
          <p className="text-neutral-600 mb-8">
            למשרה: <span className="font-semibold">{job.title}</span>
          </p>
          <ApplicationForm jobId={params.jobId} jobTitle={job.title} />
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
          <p className="text-neutral-700">
            לא הצלחנו לטעון את המשרה המבוקשת. ייתכן שהיא נסגרה, או שהשרת אינו
            זמין כרגע. נסו שוב בעוד רגע.
          </p>
          <Link
            href="/jobs"
            className="text-primary-600 font-medium mt-3 inline-block hover:underline"
          >
            חזרה ללוח המשרות
          </Link>
        </div>
      )}
    </main>
  );
}
