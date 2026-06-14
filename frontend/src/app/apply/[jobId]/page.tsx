import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicJob } from '@/lib/api';
import { MOCK_JOBS } from '@/lib/mockData';
import ApplicationForm from '@/components/forms/ApplicationForm';

interface Props {
  params: { jobId: string };
}

export const metadata: Metadata = { title: 'הגשת מועמדות' };

export default async function ApplyPage({ params }: Props) {
  // נטען מה-backend; נופלים בעדינות ל-mock אם לא זמין (פיתוח)
  const job =
    (await getPublicJob(params.jobId)) ??
    MOCK_JOBS.find((j) => j.id === params.jobId) ??
    null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-16" dir="rtl">
      <Link
        href="/jobs"
        className="text-primary-600 font-medium mb-8 inline-block hover:underline"
      >
        ← חזרה ללוח המשרות
      </Link>

      <h1 className="text-3xl font-bold text-neutral-900 mb-2">הגשת מועמדות</h1>
      {job && (
        <p className="text-neutral-600 mb-8">
          למשרה: <span className="font-semibold">{job.title}</span>
        </p>
      )}

      <ApplicationForm jobId={params.jobId} jobTitle={job?.title ?? ''} />
    </main>
  );
}
