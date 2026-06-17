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
import { Card, Button, Textarea, Input } from "@/components/ui";
import {
  FIELD_LABELS,
  regionLabel,
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
        subtitle={`${FIELD_LABELS[c.field]} · ${regionLabel(c.region)}`}
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

      {/* שיוך למשרה — בולט, כדי שהצוות יראה מיד לאיזו משרה הוגש */}
      {c.presentations.length > 0 ? (
        <div className="mb-4 rounded-xl bg-olive-50 border border-olive-300 px-4 py-3 text-sm">
          <span className="text-ink-500">הוגש למשרה: </span>
          {c.presentations.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link
                href={`/admin/jobs/${p.jobId}`}
                className="font-semibold text-olive-700 hover:underline"
              >
                {p.job?.title ?? "משרה"}
              </Link>
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-4 rounded-xl bg-sand-100 border border-sand-200 px-4 py-3 text-sm text-ink-500">
          מועמד זה אינו משויך למשרה ספציפית.
        </div>
      )}

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

// תווית פעולה ידידותית למעבר סטטוס (פועל, לא שם הסטטוס)
function actionLabel(from: CandidateStatus, to: CandidateStatus): string {
  switch (to) {
    case "in_progress":
      return from === "new" ? "קח לטיפול" : "החזר לטיפול";
    case "presented":
      return "סמן: הוצג למעסיק";
    case "hired":
      return "סמן: גויס ✓";
    case "not_suitable":
      return "סמן: לא מתאים";
    default:
      return CANDIDATE_STATUS_LABELS[to];
  }
}

function actionVariant(
  to: CandidateStatus,
): "primary" | "secondary" | "outline" {
  if (to === "hired") return "secondary"; // חיובי — olive
  if (to === "not_suitable") return "outline"; // ניטרלי
  return "primary";
}

// ---- פרטי מועמד + פעולות מהירות + הערות פנימיות ----
function DetailsCard({
  c,
  onChanged,
}: {
  c: CandidateDetail;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(c.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const nextStatuses = CANDIDATE_TRANSITIONS[c.status];

  // שינוי סטטוס בלחיצה אחת — פעולה ברורה ומיידית
  const changeStatus = async (status: CandidateStatus) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await updateCandidate(c.id, { status });
      setMsg(`הסטטוס עודכן ל"${CANDIDATE_STATUS_LABELS[status]}"`);
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setErr("");
    setMsg("");
    try {
      await updateCandidate(c.id, { notes });
      setMsg("ההערות נשמרו");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-display text-ink-900 mb-1">
          פעולות מהירות
        </h2>
        <p className="text-sm text-ink-500">
          סטטוס נוכחי:{" "}
          <span className="font-semibold text-ink-900">
            {CANDIDATE_STATUS_LABELS[c.status]}
          </span>
        </p>
      </div>

      {nextStatuses.length === 0 ? (
        <p className="text-sm text-ink-400">
          סטטוס סופי ({CANDIDATE_STATUS_LABELS[c.status]}) — אין פעולות נוספות.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={actionVariant(s)}
              onClick={() => changeStatus(s)}
              disabled={busy}
            >
              {actionLabel(c.status, s)}
            </Button>
          ))}
        </div>
      )}

      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}

      <div className="pt-4 border-t border-sand-100 space-y-2">
        <Textarea
          label="הערות פנימיות (לצוות בלבד)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="הערות, רשמים, מידע פנימי..."
        />
        <Button
          size="sm"
          variant="outline"
          onClick={saveNotes}
          disabled={savingNotes}
        >
          {savingNotes ? "שומר..." : "שמירת הערות"}
        </Button>
      </div>
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
        ...(followUpAt
          ? { followUpAt: new Date(followUpAt).toISOString() }
          : {}),
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
            <li key={log.id} className="border-r-2 border-navy-100 pr-3 py-1">
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
            {resumeErr && (
              <p className="text-xs text-red-600 mt-1">{resumeErr}</p>
            )}
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
