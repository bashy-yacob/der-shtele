"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCandidate,
  updateCandidate,
  getCandidateResume,
  addCallLog,
} from "@/lib/admin-api";
import type { CandidateDetail, CandidateStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Select, Textarea, Input } from "@/components/ui";
import {
  FIELD_LABELS,
  REGION_LABELS,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/labels";
import { CANDIDATE_TRANSITIONS } from "@/lib/status-machine";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [c, setC] = useState<CandidateDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () =>
    getCandidate(id)
      .then(setC)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!c) return <EmptyState message="מועמד לא נמצא" />;

  return (
    <div>
      <PageHeader
        title={c.fullName}
        subtitle={`${FIELD_LABELS[c.field]} · ${REGION_LABELS[c.region]}`}
        action={
          <StatusBadge
            status={c.status}
            label={CANDIDATE_STATUS_LABELS[c.status]}
          />
        }
      />
      <Link
        href="/admin/candidates"
        className="text-sm text-navy-600 hover:underline mb-4 inline-block"
      >
        → חזרה לרשימת המועמדים
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailsCard c={c} onChanged={reload} />
          <CallLogCard
            c={c}
            staffName={user?.fullName || user?.email || "צוות"}
            onAdded={reload}
          />
        </div>
        <div className="space-y-6">
          <ContactCard c={c} />
          <RelatedCard c={c} />
        </div>
      </div>
    </div>
  );
}

// ---- פרטי מועמד + סטטוס + הערות פנימיות ----
function DetailsCard({
  c,
  onChanged,
}: {
  c: CandidateDetail;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(c.notes ?? "");
  const [status, setStatus] = useState<CandidateStatus | "">("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const nextStatuses = CANDIDATE_TRANSITIONS[c.status];

  const save = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await updateCandidate(c.id, {
        notes,
        ...(status ? { status } : {}),
      });
      setMsg("נשמר בהצלחה");
      setStatus("");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-display text-ink-900">פרטים וטיפול</h2>

      {nextStatuses.length > 0 && (
        <Select
          label="שינוי סטטוס"
          value={status}
          onChange={(e) => setStatus(e.target.value as CandidateStatus | "")}
        >
          <option value="">— ללא שינוי —</option>
          {nextStatuses.map((s) => (
            <option key={s} value={s}>
              {CANDIDATE_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      )}

      <Textarea
        label="הערות פנימיות (לצוות בלבד)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="הערות, רשמים, מידע פנימי..."
      />

      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}

      <Button onClick={save} disabled={busy}>
        {busy ? "שומר..." : "שמירה"}
      </Button>
    </Card>
  );
}

// ---- היסטוריית שיחות + הוספת שיחה ----
function CallLogCard({
  c,
  staffName,
  onAdded,
}: {
  c: CandidateDetail;
  staffName: string;
  onAdded: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const add = async () => {
    if (summary.trim().length < 2) {
      setErr("יש לכתוב סיכום שיחה");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await addCallLog(c.id, {
        staffName,
        summary,
        ...(followUpAt ? { followUpAt: new Date(followUpAt).toISOString() } : {}),
      });
      setSummary("");
      setFollowUpAt("");
      onAdded();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-display text-ink-900">היסטוריית שיחות</h2>

      <div className="space-y-3 bg-sand-50 rounded-xl p-4">
        <Textarea
          label="הוספת שיחה"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="סיכום השיחה..."
        />
        <Input
          type="datetime-local"
          label="תזכורת לשיחה חוזרת (אופציונלי)"
          value={followUpAt}
          onChange={(e) => setFollowUpAt(e.target.value)}
        />
        {err && <ErrorNote message={err} />}
        <Button size="sm" onClick={add} disabled={busy}>
          {busy ? "מוסיף..." : "הוספת שיחה"}
        </Button>
      </div>

      {c.callLogs.length === 0 ? (
        <EmptyState message="אין עדיין שיחות מתועדות" />
      ) : (
        <ul className="space-y-3">
          {c.callLogs.map((log) => (
            <li
              key={log.id}
              className="border-r-2 border-navy-100 pr-3 py-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">
                  {log.staffName}
                </span>
                <span className="text-xs text-ink-400">
                  {formatDateTime(log.calledAt)}
                </span>
              </div>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">
                {log.summary}
              </p>
              {log.followUpAt && (
                <p className="text-xs text-olive-700 mt-1">
                  שיחה חוזרת: {formatDateTime(log.followUpAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---- פרטי קשר + קו"ח + הסכמת מייל ----
function ContactCard({ c }: { c: CandidateDetail }) {
  const [resumeErr, setResumeErr] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);

  const openResume = async () => {
    setLoadingResume(true);
    setResumeErr("");
    try {
      const { url } = await getCandidateResume(c.id);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setResumeErr((e as Error).message);
    } finally {
      setLoadingResume(false);
    }
  };

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-display text-ink-900">פרטי קשר</h2>
      <Row label="טלפון" value={c.phone} />
      <Row label="מייל" value={c.email} />
      <Row label="עיר" value={c.city || "—"} />

      <div className="pt-2 border-t border-sand-100">
        <p className="text-sm font-semibold text-ink-700 mb-1">קורות חיים</p>
        {c.cvUrl ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={openResume}
              disabled={loadingResume}
            >
              {loadingResume ? "טוען..." : "הורדת קו״ח"}
            </Button>
            {c.cvUploadedAt && (
              <p className="text-xs text-ink-400 mt-1">
                הועלה {formatDate(c.cvUploadedAt)}
              </p>
            )}
            {resumeErr && <p className="text-xs text-red-600 mt-1">{resumeErr}</p>}
          </>
        ) : (
          <p className="text-sm text-ink-400">לא הועלו קורות חיים</p>
        )}
      </div>
    </Card>
  );
}

// ---- משרות שהוגש אליהן + גיוסים ----
function RelatedCard({ c }: { c: CandidateDetail }) {
  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-display text-ink-900">משרות רלוונטיות</h2>
      {c.presentations.length === 0 ? (
        <p className="text-sm text-ink-400">לא הוצג לאף משרה</p>
      ) : (
        <ul className="space-y-2">
          {c.presentations.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2">
              <Link
                href={`/admin/jobs/${p.jobId}`}
                className="text-sm text-navy-600 hover:underline truncate"
              >
                {p.job?.title ?? "משרה"}
              </Link>
              <StatusBadge
                status={p.status}
                label={CANDIDATE_STATUS_LABELS[p.status]}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-900 font-semibold">{value}</span>
    </div>
  );
}
