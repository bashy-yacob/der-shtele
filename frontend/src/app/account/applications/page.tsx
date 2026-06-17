"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import {
  CANDIDATE_STATUS_LABELS,
  FIELD_LABELS,
  STATUS_TONE,
  regionLabel,
} from "@/lib/labels";
import type { CandidateStatus, JobField } from "@/types";

interface ApplicationItem {
  id: string;
  presentedAt: string;
  status: CandidateStatus;
  job: {
    id: string;
    title: string;
    field: JobField;
    region: string;
    scope: string;
  } | null;
}

export default function MyApplicationsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ApplicationItem[] | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;
    fetch("/api/candidates/me/applications", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setItems([]));
  }, [getToken]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">ההגשות שלי</h1>

      {items === null ? (
        <Card className="text-center text-ink-500 py-12">טוען...</Card>
      ) : items.length === 0 ? (
        <Card className="text-center text-ink-500 py-12">
          עדיין לא הגשת מועמדות. עיין/ני ב
          <Link
            href="/jobs"
            className="text-navy-600 font-semibold hover:underline"
          >
            {" "}
            לוח המשרות
          </Link>
          .
        </Card>
      ) : (
        <ul className="space-y-4">
          {items.map((app) => (
            <li key={app.id}>
              <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    {app.job ? app.job.title : "משרה שהוסרה"}
                  </h2>
                  {app.job && (
                    <p className="text-sm text-ink-500 mt-1">
                      {FIELD_LABELS[app.job.field]} ·{" "}
                      {regionLabel(app.job.region)} · {app.job.scope}
                    </p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">
                    הוגש ב-{new Date(app.presentedAt).toLocaleDateString("he-IL")}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold rounded-lg px-3 py-1 ${
                    STATUS_TONE[app.status] ?? "bg-sand-100 text-ink-500"
                  }`}
                >
                  {CANDIDATE_STATUS_LABELS[app.status]}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
