import type { Metadata } from "next";
import Link from "next/link";
import { getPublicJob } from "@/lib/api";
import ApplicationForm from "@/components/forms/ApplicationForm";

interface Props {
  params: { jobId: string };
}

export const metadata: Metadata = { title: "הגשת מועמדות" };

export default async function ApplyPage({ params }: Props) {
  // נטען מה-backend האמיתי בלבד. אם המשרה לא נמצאה / השרת לא זמין — מציגים
  // הודעה ברורה, ולא טופס למשרה שלא קיימת (אין יותר נפילה ל-mock).
  const job = await getPublicJob(params.jobId);

  return (
    <main className="min-h-screen bg-sand-100">
      <div className="max-w-2xl mx-auto px-4 py-16" dir="rtl">
        <Link
          href="/jobs"
          className="text-navy-600 font-medium mb-8 inline-block hover:text-navy-700 hover:underline"
        >
          ← חזרה ללוח המשרות
        </Link>

        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
          הגשת מועמדות
        </h1>

        {job ? (
          <>
            <p className="text-ink-700 mb-8">
              למשרה:{" "}
              <span className="font-semibold text-ink-900">{job.title}</span>
            </p>
            <ApplicationForm jobId={params.jobId} jobTitle={job.title} />
          </>
        ) : (
          <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-6 mt-6">
            <p className="text-ink-700">
              לא הצלחנו לטעון את המשרה המבוקשת. ייתכן שהיא נסגרה, או שהשרת אינו
              זמין כרגע. נסו שוב בעוד רגע.
            </p>
            <Link
              href="/jobs"
              className="text-navy-600 font-medium mt-3 inline-block hover:text-navy-700 hover:underline"
            >
              חזרה ללוח המשרות
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
