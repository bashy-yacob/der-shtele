"use client";

import { useEffect, useState } from "react";
import {
  listSubscribers,
  sendMailing,
  listRegions,
  getShabbatStatus,
} from "@/lib/admin-api";
import type { CandidateStatus, JobField, Region, Subscriber } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input, Select, Textarea } from "@/components/ui";
import {
  FIELD_LABELS,
  regionLabel,
  buildCityOptions,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/labels";
import { formatDate } from "@/lib/utils";

type Filter = {
  field?: JobField;
  region?: Region;
  status?: CandidateStatus;
};

export default function MailingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filter, setFilter] = useState<Filter>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());

  const load = (f: Filter) => {
    setLoading(true);
    setError("");
    listSubscribers(f)
      .then(setSubscribers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load({});
    listRegions()
      .then((r) => setCityOptions(buildCityOptions(r)))
      .catch(() => undefined);
  }, []);

  const applyFilter = (patch: Partial<Filter>) => {
    const next = { ...filter, ...patch };
    // ניקוי מפתחות ריקים
    (Object.keys(next) as (keyof Filter)[]).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    setFilter(next);
    load(next);
  };

  const exportCsv = () => {
    const header = ["שם מלא", "מייל", "תחום", "אזור", "סטטוס", "תאריך הסכמה"];
    const lines = subscribers.map((s) =>
      [
        s.fullName,
        s.email,
        s.field ? FIELD_LABELS[s.field] : "",
        s.region ? regionLabel(s.region) : "",
        s.status ? CANDIDATE_STATUS_LABELS[s.status] : "",
        s.optInAt ? formatDate(s.optInAt) : "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    // BOM כדי שאקסל יזהה עברית UTF-8
    const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="רשימת תפוצה"
        subtitle="מנויים עם הסכמת מייל תקפה — שליחה ידנית וייצוא"
        action={
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={subscribers.length === 0}
          >
            ייצוא ל-CSV
          </Button>
        }
      />

      <div className="mb-6 sm:max-w-xs">
        <StatCard
          label="מנויים בסינון הנוכחי"
          value={subscribers.length}
          tone="accent"
        />
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          <Select
            label="תחום"
            value={filter.field ?? ""}
            onChange={(e) =>
              applyFilter({ field: (e.target.value || undefined) as JobField })
            }
          >
            <option value="">כל התחומים</option>
            {Object.entries(FIELD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            label="אזור"
            value={filter.region ?? ""}
            onChange={(e) =>
              applyFilter({ region: (e.target.value || undefined) as Region })
            }
          >
            <option value="">כל האזורים</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Select
            label="סטטוס"
            value={filter.status ?? ""}
            onChange={(e) =>
              applyFilter({
                status: (e.target.value || undefined) as CandidateStatus,
              })
            }
          >
            <option value="">כל הסטטוסים</option>
            {Object.entries(CANDIDATE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <SendCard filter={filter} count={subscribers.length} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : subscribers.length === 0 ? (
        <EmptyState message="אין מנויים התואמים לסינון" />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-ink-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">שם</th>
                <th className="px-4 py-3 text-start font-semibold">מייל</th>
                <th className="px-4 py-3 text-start font-semibold">תחום</th>
                <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
                <th className="px-4 py-3 text-start font-semibold">הסכמה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {subscribers.map((s) => (
                <tr key={s.userId} className="hover:bg-sand-50">
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    {s.fullName}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.email}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {s.field ? FIELD_LABELS[s.field] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.status ? (
                      <StatusBadge
                        status={s.status}
                        label={CANDIDATE_STATUS_LABELS[s.status]}
                      />
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-400 whitespace-nowrap">
                    {s.optInAt ? formatDate(s.optInAt) : "—"}
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

function SendCard({ filter, count }: { filter: Filter; count: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [shabbat, setShabbat] = useState<{
    forbidden: boolean;
    until: string | null;
  } | null>(null);
  const confirm = useConfirm();

  // מצב שבת/חג — לחסימת שליחה בצד-לקוח (מתעדכן בכל טעינת העמוד).
  useEffect(() => {
    getShabbatStatus()
      .then(setShabbat)
      .catch(() => undefined);
  }, []);

  const send = async () => {
    if (subject.trim().length < 2 || body.trim().length < 1) {
      setErr("יש למלא נושא ותוכן");
      return;
    }
    if (shabbat?.forbidden) {
      setErr("כעת שבת או יום טוב — לא ניתן לשלוח דיוור.");
      return;
    }
    // אישור לפני שליחה המונית — פעולה בלתי-הפיכה.
    if (
      !(await confirm({
        title: "שליחת דיוור",
        message: `לשלוח את ההודעה "${subject.trim()}" ל-${count} מנויים? לא ניתן לבטל שליחה.`,
        confirmLabel: "שלח",
      }))
    )
      return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await sendMailing({ subject, body, filter });
      setMsg(`נשלח ל-${res.sent} מתוך ${res.total} מנויים`);
      setSubject("");
      setBody("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6 space-y-3">
      <h2 className="text-lg font-display text-ink-900">שליחה ידנית</h2>
      <p className="text-sm text-ink-500">
        ההודעה תישלח ל-{count} המנויים שבסינון הנוכחי. לא ניתן לשלוח בשבת או
        ביום טוב.
      </p>
      {shabbat?.forbidden && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          🕯️ כעת שבת/יום טוב — השליחה חסומה
          {shabbat.until
            ? ` עד צאת השבת/החג (${formatDate(shabbat.until)})`
            : ""}
          .
        </p>
      )}
      <Input
        label="נושא"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Textarea
        label="תוכן ההודעה"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="טקסט חופשי — יישלח לכל המנויים שבסינון"
      />
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <Button
        onClick={send}
        disabled={busy || count === 0 || !!shabbat?.forbidden}
      >
        {busy ? "שולח..." : `שליחה ל-${count} מנויים`}
      </Button>
    </Card>
  );
}
