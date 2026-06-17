"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard } from "@/lib/admin-api";
import type { DashboardSummary } from "@/types";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card } from "@/components/ui";
import { FIELD_LABELS, regionLabel } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!data) return <EmptyState message="אין נתונים להצגה" />;

  const { stats, queue, activeJobs, openReminders } = data;

  return (
    <div>
      <PageHeader title="לוח בקרה" subtitle="תמונת מצב של פעילות הסוכנות" />

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="בתור טיפול"
          value={stats.queueCount}
          hint="מועמדים חדשים שטרם טופלו"
          tone={stats.queueCount > 0 ? "accent" : "default"}
        />
        <StatCard label="קו״ח השבוע" value={stats.newCandidatesThisWeek} />
        <StatCard label="גיוסים החודש" value={stats.placementsThisMonth} />
        <StatCard
          label="עמלות פתוחות"
          value={formatCurrency(stats.pendingCommissions)}
        />
        <StatCard label="מועמדים פעילים" value={stats.activeCandidates} />
        <StatCard label="משרות פעילות" value={stats.activeJobs} />
        <StatCard
          label="תזכורות שעבר זמנן"
          value={stats.overdueReminders}
          tone={stats.overdueReminders > 0 ? "warn" : "default"}
        />
        <StatCard label="מנויי מייל פעילים" value={stats.activeSubscribers} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* תור טיפול */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-ink-900">תור טיפול</h2>
            <Link
              href="/admin/candidates"
              className="text-sm text-navy-600 font-semibold hover:underline"
            >
              לכל המועמדים ←
            </Link>
          </div>
          {queue.length === 0 ? (
            <EmptyState message="אין מועמדים חדשים הממתינים לטיפול 🎉" />
          ) : (
            <ul className="divide-y divide-sand-100">
              {queue.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    className="flex items-center justify-between py-3 hover:bg-sand-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{c.fullName}</p>
                      <p className="text-xs text-ink-500">
                        {FIELD_LABELS[c.field]} · {regionLabel(c.region)}
                      </p>
                      {c.job ? (
                        <p className="text-xs text-olive-700 font-semibold mt-0.5">
                          הוגש למשרה: {c.job.title}
                        </p>
                      ) : (
                        <p className="text-xs text-ink-400 mt-0.5">
                          ללא שיוך למשרה
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-ink-400 whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* משרות פעילות */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-ink-900">משרות פעילות</h2>
            <Link
              href="/admin/jobs"
              className="text-sm text-navy-600 font-semibold hover:underline"
            >
              לכל המשרות ←
            </Link>
          </div>
          {activeJobs.length === 0 ? (
            <EmptyState message="אין משרות פעילות" />
          ) : (
            <ul className="divide-y divide-sand-100">
              {activeJobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/admin/jobs/${j.id}`}
                    className="flex items-center justify-between py-3 hover:bg-sand-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{j.title}</p>
                      <p className="text-xs text-ink-500">
                        {FIELD_LABELS[j.field]} · {regionLabel(j.region)}
                      </p>
                    </div>
                    <span className="text-xs text-ink-500 whitespace-nowrap">
                      {j.presentedCount} מועמדים הוצגו
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* תזכורות פתוחות */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-ink-900">
              תזכורות פתוחות
            </h2>
            <Link
              href="/admin/reminders"
              className="text-sm text-navy-600 font-semibold hover:underline"
            >
              לכל התזכורות ←
            </Link>
          </div>
          {openReminders.length === 0 ? (
            <EmptyState message="אין תזכורות פתוחות" />
          ) : (
            <ul className="divide-y divide-sand-100">
              {openReminders.map((r) => {
                const overdue = new Date(r.remindAt) < new Date();
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm text-ink-900">{r.message}</p>
                      <p className="text-xs text-ink-400">
                        נוצר ע״י {r.createdBy}
                      </p>
                    </div>
                    <StatusBadge
                      status={overdue ? "cancelled" : "in_progress"}
                      label={formatDate(r.remindAt)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
