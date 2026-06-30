"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listJobs } from "@/lib/admin-api";
import type { InternalJob, JobStatus } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPager } from "@/components/admin/AdminPager";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input, Select } from "@/components/ui";
import { FIELD_LABELS, regionLabel, JOB_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 15;

// סדר תצוגה — משרות הממתינות לאישור קודם, כדי שהצוות יראה אותן ראשונות.
const STATUS_ORDER: Record<JobStatus, number> = {
  pending: 0,
  active: 1,
  paused: 2,
  filled: 3,
  closed: 4,
};

export default function JobsListPage() {
  const [jobs, setJobs] = useState<InternalJob[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = useMemo(
    () => jobs.filter((j) => j.status === "pending").length,
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs
      .filter((j) => {
        if (statusFilter && j.status !== statusFilter) return false;
        if (q) {
          const hay =
            `${j.title} ${j.employer?.companyName ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (s !== 0) return s;
        return +new Date(b.openedAt) - +new Date(a.openedAt);
      });
  }, [jobs, search, statusFilter]);

  useEffect(() => setPage(1), [search, statusFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="ניהול משרות"
        subtitle={
          filtered.length === jobs.length
            ? jobs.length === 1
              ? "משרה אחת במערכת"
              : `${jobs.length} משרות במערכת`
            : `מציג ${filtered.length} מתוך ${jobs.length} משרות`
        }
        action={
          <Link href="/admin/jobs/new">
            <Button>משרה חדשה +</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="חיפוש"
            placeholder="תפקיד או שם מעסיק"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="סטטוס"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | "")}
          >
            <option value="">
              כל הסטטוסים
              {pendingCount > 0 ? ` (${pendingCount} ממתינות לאישור)` : ""}
            </option>
            {(Object.keys(JOB_STATUS_LABELS) as JobStatus[]).map((s) => (
              <option key={s} value={s}>
                {JOB_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : jobs.length === 0 ? (
        <EmptyState message="אין משרות. צור משרה חדשה כדי להתחיל." />
      ) : filtered.length === 0 ? (
        <EmptyState message="לא נמצאו משרות התואמות לסינון." />
      ) : (
        <>
          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">תפקיד</th>
                  <th className="px-4 py-3 text-start font-semibold">מעסיק</th>
                  <th className="px-4 py-3 text-start font-semibold">תחום</th>
                  <th className="px-4 py-3 text-start font-semibold">אזור</th>
                  <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
                  <th className="px-4 py-3 text-start font-semibold">נפתחה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {pageItems.map((j) => (
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
                      {j.employer?.companyName ?? "מעסיק חסר"}
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
          <AdminPager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
