"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getJob,
  updateJob,
  listCandidates,
  createPresentation,
  updatePresentation,
  listRegions,
} from "@/lib/admin-api";
import type {
  Candidate,
  CandidateStatus,
  JobDetail,
  JobField,
  JobStatus,
  Region,
} from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  CityCombobox,
} from "@/components/ui";
import {
  FIELD_LABELS,
  regionLabel,
  buildCityOptions,
  JOB_STATUS_LABELS,
  CANDIDATE_STATUS_LABELS,
  SCOPE_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/labels";
import { JOB_TRANSITIONS, CANDIDATE_TRANSITIONS } from "@/lib/status-machine";
import { formatDate } from "@/lib/utils";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () =>
    getJob(id)
      .then(setJob)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!job) return <EmptyState message="משרה לא נמצאה" />;

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={`${FIELD_LABELS[job.field]} · ${regionLabel(job.region)} · ${job.scope}`}
        action={
          <StatusBadge
            status={job.status}
            label={JOB_STATUS_LABELS[job.status]}
          />
        }
      />
      <Link
        href="/admin/jobs"
        className="text-sm text-navy-600 hover:underline mb-4 inline-block"
      >
        → חזרה לרשימת המשרות
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EditCard job={job} onChanged={reload} />
          <PresentationsCard job={job} onChanged={reload} />
        </div>
        <div className="space-y-6">
          <StatusCard job={job} onChanged={reload} />
          <EmployerCard job={job} />
        </div>
      </div>
    </div>
  );
}

function EditCard({
  job,
  onChanged,
}: {
  job: JobDetail;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    title: job.title,
    descriptionPublic: job.descriptionPublic,
    descriptionInternal: job.descriptionInternal,
    field: job.field as JobField,
    region: job.region as Region,
    scope: job.scope,
    experience: job.experience ?? "",
    salary: job.salary ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>(
    buildCityOptions(job.region ? [job.region] : []),
  );

  useEffect(() => {
    listRegions()
      .then((r) => setCityOptions(buildCityOptions([...r, job.region])))
      .catch(() => undefined);
  }, [job.region]);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await updateJob(job.id, form);
      setMsg("נשמר בהצלחה");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-display text-ink-900">פרטי המשרה</h2>
      <Input
        label="שם התפקיד"
        value={form.title}
        onChange={(e) => set("title")(e.target.value)}
      />
      <div className="grid md:grid-cols-3 gap-3">
        <Select
          label="תחום"
          value={form.field}
          onChange={(e) => set("field")(e.target.value)}
        >
          {Object.entries(FIELD_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <CityCombobox
          label="עיר / אזור"
          options={cityOptions}
          value={form.region}
          onChange={(e) => set("region")(e.target.value)}
        />
        <Select
          label="היקף"
          value={form.scope}
          onChange={(e) => set("scope")(e.target.value)}
        >
          {SCOPE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Select
          label="ניסיון נדרש (גלוי באתר)"
          value={form.experience}
          onChange={(e) => set("experience")(e.target.value)}
        >
          <option value="">— ללא ציון —</option>
          {EXPERIENCE_OPTIONS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </Select>
        <Input
          label="טווח שכר מוצע (פנימי — לא עולה לאתר)"
          value={form.salary}
          onChange={(e) => set("salary")(e.target.value)}
        />
      </div>
      <div className="rounded-xl border border-olive-300 bg-olive-50 p-3">
        <Textarea
          label="תיאור ציבורי (אנונימי — עולה לאתר)"
          value={form.descriptionPublic}
          onChange={(e) => set("descriptionPublic")(e.target.value)}
        />
      </div>
      <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-3">
        <Textarea
          label="תיאור פנימי (לא חשוף לציבור)"
          value={form.descriptionInternal}
          onChange={(e) => set("descriptionInternal")(e.target.value)}
        />
      </div>
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <Button onClick={save} disabled={busy}>
        {busy ? "שומר..." : "שמירת שינויים"}
      </Button>
    </Card>
  );
}

function StatusCard({
  job,
  onChanged,
}: {
  job: JobDetail;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const next = JOB_TRANSITIONS[job.status];

  const change = async (status: JobStatus) => {
    setBusy(true);
    setErr("");
    try {
      await updateJob(job.id, { status });
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-display text-ink-900">סטטוס ופרסום</h2>
      <p className="text-sm text-ink-500">
        סטטוס נוכחי:{" "}
        <span className="font-semibold text-ink-900">
          {JOB_STATUS_LABELS[job.status]}
        </span>
      </p>
      {job.status !== "active" && (
        <p className="text-xs text-ink-400">
          רק משרה בסטטוס &quot;פעילה&quot; מוצגת באתר הציבורי.
        </p>
      )}
      {next.length === 0 ? (
        <p className="text-sm text-ink-400">סטטוס סופי — אין מעברים נוספים.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {next.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === "active" ? "secondary" : "outline"}
              onClick={() => change(s)}
              disabled={busy}
            >
              {s === "active" ? "פרסם באתר" : JOB_STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      )}
      {err && <ErrorNote message={err} />}
    </Card>
  );
}

function EmployerCard({ job }: { job: JobDetail }) {
  const e = job.employer;
  return (
    <Card className="space-y-2">
      <h2 className="text-lg font-display text-ink-900">מעסיק (פנימי)</h2>
      {!e ? (
        <p className="text-sm text-ink-400">לא נמצא מעסיק</p>
      ) : (
        <>
          <p className="font-semibold text-ink-900">{e.companyName}</p>
          <p className="text-sm text-ink-700">
            {e.contactName} · {e.contactPhone}
          </p>
          <p className="text-sm text-ink-500">{e.contactEmail}</p>
          <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mt-2">
            פרטי מעסיק אלה אינם חשופים לציבור או למועמדים.
          </p>
        </>
      )}
    </Card>
  );
}

function PresentationsCard({
  job,
  onChanged,
}: {
  job: JobDetail;
  onChanged: () => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    listCandidates()
      .then(setCandidates)
      .catch(() => undefined);
  }, []);

  const presentedIds = new Set(job.presentations.map((p) => p.candidateId));
  const available = candidates.filter((c) => !presentedIds.has(c.id));

  const present = async () => {
    if (!pick) return;
    setBusy(true);
    setErr("");
    try {
      await createPresentation({ jobId: job.id, candidateId: pick });
      setPick("");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (presId: string, status: CandidateStatus) => {
    try {
      await updatePresentation(presId, { status });
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-display text-ink-900">
        מועמדים שהוצגו ({job.presentations.length})
      </h2>

      <div className="flex gap-2 items-end bg-sand-50 rounded-xl p-3">
        <div className="flex-1">
          <Select
            label="הצגת מועמד למשרה"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          >
            <option value="">— בחר מועמד —</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({FIELD_LABELS[c.field]})
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={present} disabled={busy || !pick}>
          הצג
        </Button>
      </div>

      {err && <ErrorNote message={err} />}

      {job.presentations.length === 0 ? (
        <EmptyState message="טרם הוצגו מועמדים למשרה זו" />
      ) : (
        <ul className="divide-y divide-sand-100">
          {job.presentations.map((p) => {
            const transitions = CANDIDATE_TRANSITIONS[p.status] ?? [];
            return (
              <li
                key={p.id}
                className="py-3 flex items-center justify-between gap-2"
              >
                <Link
                  href={`/admin/candidates/${p.candidateId}`}
                  className="text-sm font-semibold text-navy-600 hover:underline"
                >
                  {p.candidate?.fullName ?? "מועמד"}
                </Link>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={p.status}
                    label={CANDIDATE_STATUS_LABELS[p.status]}
                  />
                  {transitions.length > 0 && (
                    <select
                      className="text-xs border border-sand-300 rounded-lg px-2 py-1 bg-white"
                      value=""
                      onChange={(e) =>
                        e.target.value &&
                        changeStatus(p.id, e.target.value as CandidateStatus)
                      }
                    >
                      <option value="">שנה...</option>
                      {transitions.map((t) => (
                        <option key={t} value={t}>
                          {CANDIDATE_STATUS_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-ink-400">
        הוצגו {formatDate(job.openedAt)} ואילך · המעסיק אינו רואה פרטי קשר של
        מועמדים.
      </p>
    </Card>
  );
}
