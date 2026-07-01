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
  CandidateListItem,
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
  BackLink,
  PhoneLink,
  EmailLink,
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
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { cn, formatDate } from "@/lib/utils";

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
      <BackLink href="/admin/jobs">חזרה לרשימת המשרות</BackLink>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EditCard job={job} onChanged={reload} />
          <PresentationsCard job={job} onChanged={reload} />
        </div>
        <div className="space-y-6">
          <StatusCard job={job} onChanged={reload} />
          <FeaturedCard job={job} onChanged={reload} />
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
  const confirm = useConfirm();
  const next = JOB_TRANSITIONS[job.status];

  // תווית/גוון/אישור לכל מעבר — תלוי גם בסטטוס המקור (אישור מול דחייה מול סגירה).
  const meta = (
    s: JobStatus,
  ): {
    label: string;
    variant: "secondary" | "outline";
    danger?: boolean;
    confirm?: string;
  } => {
    if (s === "active")
      return {
        label:
          job.status === "pending"
            ? "אשר ופרסם"
            : job.status === "paused"
              ? "החזר לאתר"
              : "פרסם באתר",
        variant: "secondary",
      };
    if (s === "closed")
      return job.status === "pending"
        ? {
            label: "דחה משרה",
            variant: "outline",
            danger: true,
            confirm:
              "דחיית המשרה תסגור אותה והיא לא תפורסם באתר. פעולה זו סופית — להמשיך?",
          }
        : {
            label: "סגור משרה",
            variant: "outline",
            danger: true,
            confirm: "סגירת משרה היא סופית ולא ניתן להחזירה. להמשיך?",
          };
    if (s === "filled")
      return {
        label: "סמן כאוישה",
        variant: "outline",
        confirm: "סימון המשרה כאוישה הוא סופי. להמשיך?",
      };
    if (s === "paused") return { label: "השהה", variant: "outline" };
    return { label: JOB_STATUS_LABELS[s], variant: "outline" };
  };

  const change = async (
    status: JobStatus,
    m?: { label: string; danger?: boolean; confirm?: string },
  ) => {
    if (
      m?.confirm &&
      !(await confirm({
        message: m.confirm,
        danger: m.danger,
        confirmLabel: m.label,
      }))
    )
      return;
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
      {job.status === "pending" && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
          ⏳ משרה זו פורסמה על ידי מעסיק וממתינה לאישור. לחץ על &quot;אשר
          ופרסם&quot; כדי לאשר אותה, או &quot;דחה משרה&quot; כדי לדחות.
        </p>
      )}
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
          {next.map((s) => {
            const m = meta(s);
            return (
              <Button
                key={s}
                size="sm"
                variant={m.variant}
                className={
                  m.danger ? "text-red-600 hover:bg-red-50" : undefined
                }
                onClick={() => change(s, m)}
                disabled={busy}
              >
                {m.label}
              </Button>
            );
          })}
        </div>
      )}
      {err && <ErrorNote message={err} />}
    </Card>
  );
}

function FeaturedCard({
  job,
  onChanged,
}: {
  job: JobDetail;
  onChanged: () => void;
}) {
  const [until, setUntil] = useState(
    job.featuredUntil ? job.featuredUntil.slice(0, 10) : "",
  );
  const [price, setPrice] = useState(
    job.featuredPrice != null ? String(job.featuredPrice) : "",
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const paid = job.featuredPaymentStatus === "paid";
  const active =
    paid && !!job.featuredUntil && new Date(job.featuredUntil) >= new Date();

  type JobPatch = Parameters<typeof updateJob>[1];
  const save = async (extra: JobPatch = {}) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await updateJob(job.id, {
        featuredUntil: until ? new Date(until).toISOString() : null,
        featuredPrice: price ? Number(price) : undefined,
        ...extra,
      });
      setMsg("נשמר בהצלחה");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-display text-ink-900">קידום בתשלום</h2>
      <p className="text-sm text-ink-500">
        מצב:{" "}
        <span className="font-semibold text-ink-900">
          {active
            ? "מקודמת — מופיעה בראש הלוח"
            : paid
              ? "שולם — מחוץ לחלון התאריכים"
              : "לא מקודמת"}
        </span>
      </p>
      <Input
        label="קידום עד תאריך"
        type="date"
        value={until}
        onChange={(e) => setUntil(e.target.value)}
      />
      <Input
        label="מחיר קידום מוסכם (₪ — פנימי)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <p className="text-xs text-ink-400">
        משרה מקודמת מופיעה בראש הלוח רק לאחר תשלום ובתוך חלון התאריכים.
      </p>
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => save()}
          disabled={busy}
        >
          שמירת תאריך/מחיר
        </Button>
        {!paid ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => save({ featuredPaymentStatus: "paid" })}
            disabled={busy}
          >
            סימון תשלום כשולם
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => save({ featuredPaymentStatus: "unpaid" })}
            disabled={busy}
          >
            ביטול סימון תשלום
          </Button>
        )}
      </div>
      {job.featuredPaidAt && (
        <p className="text-xs text-ink-400">
          תשלום סומן: {formatDate(job.featuredPaidAt)}
        </p>
      )}
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
            {e.contactName} · <PhoneLink phone={e.contactPhone} />
          </p>
          <p className="text-sm text-ink-500">
            <EmailLink email={e.contactEmail} />
          </p>
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
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [pick, setPick] = useState("");
  const [query, setQuery] = useState("");
  const [onlyField, setOnlyField] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    listCandidates()
      .then(setCandidates)
      .catch(() => undefined);
  }, []);

  const presentedIds = new Set(job.presentations.map((p) => p.candidateId));
  const available = candidates.filter((c) => !presentedIds.has(c.id));
  // בורר מסונן: קודם לפי תחום המשרה (ברירת מחדל), ואז חיפוש חופשי בשם.
  const q = query.trim();
  const matches = available.filter(
    (c) =>
      (!onlyField || c.field === job.field) &&
      (q === "" || c.fullName.includes(q)),
  );

  const present = async () => {
    if (!pick) return;
    setBusy(true);
    setErr("");
    try {
      await createPresentation({ jobId: job.id, candidateId: pick });
      setPick("");
      setQuery("");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (presId: string, status: CandidateStatus) => {
    setBusy(true);
    setErr("");
    try {
      await updatePresentation(presId, { status });
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-display text-ink-900">
        מועמדים שהוצגו ({job.presentations.length})
      </h2>

      <div className="bg-sand-50 rounded-xl p-3 space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[12rem]">
            <Input
              label="הצגת מועמד למשרה"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש לפי שם המועמד"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-ink-600 pb-3 whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyField}
              onChange={(e) => setOnlyField(e.target.checked)}
              className="rounded border-sand-300 text-navy-600 focus:ring-2 focus:ring-navy-600/30"
            />
            רק מתחום המשרה ({FIELD_LABELS[job.field]})
          </label>
        </div>
        {matches.length === 0 ? (
          <p className="text-xs text-ink-400 py-1">
            {available.length === 0
              ? "כל המועמדים כבר הוצגו למשרה זו."
              : "אין מועמדים תואמים לחיפוש."}
          </p>
        ) : (
          <ul className="max-h-52 overflow-y-auto rounded-lg border border-sand-200 bg-white divide-y divide-sand-100">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setPick(pick === c.id ? "" : c.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 text-start transition-colors",
                    pick === c.id
                      ? "bg-navy-50 ring-1 ring-inset ring-navy-200"
                      : "hover:bg-sand-50",
                  )}
                >
                  <span className="text-sm font-semibold text-ink-900">
                    {c.fullName}
                  </span>
                  <span className="text-xs text-ink-400">
                    {FIELD_LABELS[c.field]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end">
          <Button size="sm" onClick={present} disabled={busy || !pick}>
            הצג מועמד
          </Button>
        </div>
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
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <StatusBadge
                    status={p.status}
                    label={CANDIDATE_STATUS_LABELS[p.status]}
                  />
                  {transitions.map((t) =>
                    // גיוס מתבצע דרך "סמן כגויס" בכרטיס המועמד (בחירת משרה + סכום
                    // עמלה + פתיחת ערבות) — לא כעדכון סטטוס הצגה, שלא יוצר גיוס.
                    t === "hired" ? (
                      <Link key={t} href={`/admin/candidates/${p.candidateId}`}>
                        <Button size="sm" variant="secondary">
                          סמן כגויס
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        key={t}
                        size="sm"
                        variant="outline"
                        className={
                          t === "not_suitable"
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : undefined
                        }
                        onClick={() => changeStatus(p.id, t)}
                        disabled={busy}
                      >
                        {CANDIDATE_STATUS_LABELS[t]}
                      </Button>
                    ),
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
