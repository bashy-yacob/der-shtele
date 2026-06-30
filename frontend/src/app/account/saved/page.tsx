"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { FIELD_LABELS, JOB_STATUS_LABELS, regionLabel } from "@/lib/labels";
import type { JobField, JobStatus } from "@/types";

interface SavedJobItem {
  savedAt: string;
  job: {
    id: string;
    title: string;
    field: JobField;
    region: string;
    scope: string;
    status: JobStatus;
  };
}

export default function SavedJobsPage() {
  const { getToken } = useAuth();
  const { unsave } = useSavedJobs();
  const [items, setItems] = useState<SavedJobItem[] | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;
    fetch("/api/saved-jobs", { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setItems([]));
  }, [getToken]);

  const remove = async (jobId: string) => {
    await unsave(jobId); // מסיר מהשמורות בשרת + מטמון
    setItems((prev) => prev?.filter((i) => i.job.id !== jobId) ?? null);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">משרות שמורות</h1>

      {items === null ? (
        <Card className="text-center text-ink-500 py-12">טוען...</Card>
      ) : items.length === 0 ? (
        <Card className="text-center text-ink-500 py-12">
          אין משרות שמורות עדיין. סמן ♡ על משרה ב
          <Link
            href="/jobs"
            className="text-navy-600 font-semibold hover:underline"
          >
            {" "}
            לוח המשרות
          </Link>{" "}
          כדי לשמור אותה כאן.
        </Card>
      ) : (
        <ul className="space-y-4">
          {items.map(({ job }) => {
            const inactive = job.status !== "active";
            return (
              <li key={job.id}>
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-lg font-bold text-ink-900">
                        {job.title}
                      </h2>
                      {inactive && (
                        <span className="text-xs font-semibold bg-sand-100 text-ink-500 rounded-lg px-2 py-0.5">
                          לא פעילה ({JOB_STATUS_LABELS[job.status]})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-500 mt-1">
                      {FIELD_LABELS[job.field]} · {regionLabel(job.region)} ·{" "}
                      {job.scope}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inactive ? (
                      <span className="text-sm text-ink-400 px-4 py-2">
                        המשרה נסגרה
                      </span>
                    ) : (
                      <Link
                        href={`/jobs/${job.id}`}
                        className={buttonClass("primary", "sm")}
                      >
                        הגש עכשיו ←
                      </Link>
                    )}
                    <button
                      onClick={() => remove(job.id)}
                      className="text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 transition-colors"
                    >
                      הסר
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
