"use client";

// דשבורד פורטל המעסיק — רשימת המשרות שלו עם סטטוס ומספר מועמדים שהוצגו.
import { useEffect, useState } from "react";
import Link from "next/link";
import { listPortalJobs, type PortalJobListItem } from "@/lib/portal-api";
import { Button, Card } from "@/components/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { JOB_STATUS_LABELS, FIELD_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default function PortalDashboardPage() {
  const [jobs, setJobs] = useState<PortalJobListItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listPortalJobs()
      .then(setJobs)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">המשרות שלי</h1>
        <Link href="/portal/jobs/new">
          <Button size="sm">+ פרסום משרה</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!jobs ? (
        <p className="text-ink-500">טוען...</p>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-ink-500 mb-4">עדיין לא פרסמתם משרות.</p>
          <Link href="/portal/jobs/new">
            <Button>פרסום המשרה הראשונה</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/portal/jobs/${job.id}`} className="block">
              <Card className="hover:shadow-lift transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink-900">{job.title}</h2>
                    <p className="text-sm text-ink-500 mt-0.5">
                      {FIELD_LABELS[job.field]} · {job.region} · {job.scope}
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      פורסמה {formatDate(job.createdAt)} ·{" "}
                      {job._count.presentations} מועמדים הוצגו
                    </p>
                  </div>
                  <StatusBadge
                    status={job.status}
                    label={JOB_STATUS_LABELS[job.status]}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-400 leading-relaxed">
        משרה שמפרסמים עוברת לאישור הצוות לפני שהיא עולה לאתר. מועמדים מוצגים
        על ידי הצוות בלבד — פרטי הקשר שלהם נשארים אצלנו.
      </p>
    </div>
  );
}
