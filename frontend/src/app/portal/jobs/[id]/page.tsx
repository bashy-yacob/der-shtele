"use client";

// משרת מעסיק — פרטים, מועמדים שהוצגו (שם מקוצר + סטטוס, ללא פרטי קשר),
// פעולות סטטוס (השהיה/סגירה), ותקשורת עם הצוות.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getPortalJob,
  updatePortalJob,
  sendPortalMessage,
  type PortalJobDetail,
} from "@/lib/portal-api";
import { Button, Card, Textarea } from "@/components/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  JOB_STATUS_LABELS,
  CANDIDATE_STATUS_LABELS,
  FIELD_LABELS,
} from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { JobStatus } from "@/types";

export default function PortalJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<PortalJobDetail | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    getPortalJob(id)
      .then(setJob)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status: JobStatus, label: string) => {
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await updatePortalJob(id, { status });
      setMsg(`המשרה ${label}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setBusy(false);
    }
  };

  const submitMessage = async () => {
    if (message.trim().length < 2) return;
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await sendPortalMessage(message.trim());
      setMessage("");
      setMsg("ההודעה נשלחה לצוות");
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשליחה");
    } finally {
      setBusy(false);
    }
  };

  if (error && !job)
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/portal" className="text-navy-600 hover:underline">
          → חזרה למשרות
        </Link>
      </div>
    );
  if (!job) return <p className="text-ink-500">טוען...</p>;

  return (
    <div className="space-y-5">
      <Link href="/portal" className="text-sm text-navy-600 hover:underline">
        → חזרה למשרות
      </Link>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {msg && <p className="text-olive-700 text-sm">{msg}</p>}

      {/* פרטי המשרה */}
      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-xl text-ink-900">{job.title}</h1>
          <StatusBadge
            status={job.status}
            label={JOB_STATUS_LABELS[job.status]}
          />
        </div>
        <p className="text-sm text-ink-500">
          {FIELD_LABELS[job.field]} · {job.region} · {job.scope}
          {job.experience ? ` · ${job.experience}` : ""}
        </p>
        {job.status === "pending" && (
          <p className="text-sm text-amber-700">
            המשרה ממתינה לאישור הצוות לפני שתעלה לאתר.
          </p>
        )}

        <div className="pt-2 border-t border-sand-100">
          <p className="text-xs font-semibold text-ink-500 mb-1">תיאור ציבורי</p>
          <p className="text-sm text-ink-700 whitespace-pre-line">
            {job.descriptionPublic}
          </p>
        </div>
        {job.salary && (
          <p className="text-xs text-ink-400">שכר מוצע (פנימי): {job.salary}</p>
        )}

        {/* פעולות סטטוס */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-sand-100">
          {job.status === "active" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => changeStatus("paused", "הושהתה")}
              >
                השהיית משרה
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => changeStatus("closed", "נסגרה")}
              >
                סגירת משרה
              </Button>
            </>
          )}
          {job.status === "paused" && (
            <>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => changeStatus("active", "הופעלה מחדש")}
              >
                הפעלה מחדש
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => changeStatus("closed", "נסגרה")}
              >
                סגירת משרה
              </Button>
            </>
          )}
          {job.status === "pending" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => changeStatus("closed", "בוטלה")}
            >
              ביטול המשרה
            </Button>
          )}
        </div>
      </Card>

      {/* מועמדים שהוצגו */}
      <Card>
        <h2 className="font-display text-lg text-ink-900 mb-3">
          מועמדים שהוצגו ({job.presentations.length})
        </h2>
        {job.presentations.length === 0 ? (
          <p className="text-sm text-ink-500">
            הצוות עדיין לא הציג מועמדים למשרה זו.
          </p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {job.presentations.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2.5 gap-3"
              >
                <div>
                  <p className="font-medium text-ink-900">{p.candidateLabel}</p>
                  <p className="text-xs text-ink-400">
                    הוצג {formatDate(p.presentedAt)}
                  </p>
                </div>
                <StatusBadge
                  status={p.status}
                  label={CANDIDATE_STATUS_LABELS[p.status]}
                />
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-ink-400 mt-3">
          פרטי הקשר של המועמדים נשמרים אצל הצוות. לתיאום ראיון או המשך תהליך —
          פנו אלינו דרך התיבה למטה.
        </p>
      </Card>

      {/* תקשורת עם הצוות */}
      <Card className="space-y-3">
        <h2 className="font-display text-lg text-ink-900">פנייה לצוות</h2>
        <Textarea
          id="message"
          rows={3}
          label="הודעה"
          placeholder="שאלה, עדכון, או בקשה לגבי המשרה / המועמדים..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          size="sm"
          disabled={busy || message.trim().length < 2}
          onClick={submitMessage}
        >
          שליחה לצוות
        </Button>
      </Card>
    </div>
  );
}
