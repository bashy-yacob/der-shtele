"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listJobs } from "@/lib/admin-api";
import type { InternalJob } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button } from "@/components/ui";
import { FIELD_LABELS, regionLabel, JOB_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default function JobsListPage() {
  const [jobs, setJobs] = useState<InternalJob[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="ניהול משרות"
        subtitle={`${jobs.length} משרות במערכת`}
        action={
          <Link href="/admin/jobs/new">
            <Button>משרה חדשה +</Button>
          </Link>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : jobs.length === 0 ? (
        <EmptyState message="אין משרות. צור משרה חדשה כדי להתחיל." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-ink-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">תפקיד</th>
                <th className="px-4 py-3 text-start font-semibold">תחום</th>
                <th className="px-4 py-3 text-start font-semibold">אזור</th>
                <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
                <th className="px-4 py-3 text-start font-semibold">נפתחה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/jobs/${j.id}`}
                      className="font-semibold text-navy-600 hover:underline"
                    >
                      {j.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {FIELD_LABELS[j.field]}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {regionLabel(j.region)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={j.status}
                      label={JOB_STATUS_LABELS[j.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-400 whitespace-nowrap">
                    {formatDate(j.openedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
