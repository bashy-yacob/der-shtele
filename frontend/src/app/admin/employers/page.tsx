"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listEmployers,
  createEmployer,
  createPortalUser,
  approveEmployer,
  rejectEmployer,
} from "@/lib/admin-api";
import type { Employer } from "@/types";
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
  Textarea,
  Select,
  PhoneLink,
  EmailLink,
} from "@/components/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPager } from "@/components/admin/AdminPager";
import { useConfirm, usePrompt } from "@/components/admin/ConfirmDialog";
import { EMPLOYER_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // הודעת הצלחה ברמת העמוד — נשארת גלויה גם אחרי שהטופס נסגר.
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "rejected"
  >("all");
  const [page, setPage] = useState(1);

  const reload = () =>
    listEmployers()
      .then(setEmployers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => setPage(1), [search, statusFilter]);

  const PAGE_SIZE = 12;
  // מעסיקים שאינם "ממתינים" — מסוננים, ממוינים (נדחים בסוף) ומעומדים.
  const others = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employers
      .filter((e) => e.status !== "pending")
      .filter((e) => {
        if (statusFilter === "approved" && e.status === "rejected")
          return false;
        if (statusFilter === "rejected" && e.status !== "rejected")
          return false;
        if (q) {
          const hay =
            `${e.companyName} ${e.contactName} ${e.contactPhone}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // נדחים לתחתית; בתוך כל קבוצה — לפי תאריך יורד.
        const ra = a.status === "rejected" ? 1 : 0;
        const rb = b.status === "rejected" ? 1 : 0;
        if (ra !== rb) return ra - rb;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [employers, search, statusFilter]);

  const othersTotalPages = Math.ceil(others.length / PAGE_SIZE);
  const othersPage = others.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="ניהול מעסיקים"
        subtitle="פרטי מעסיקים — פנימי בלבד, לא חשוף לציבור"
        action={
          <Button
            onClick={() => {
              setShowForm((s) => !s);
              setMsg("");
            }}
          >
            {showForm ? "ביטול" : "מעסיק חדש +"}
          </Button>
        }
      />

      {showForm && (
        <EmployerForm
          onCreated={() => {
            setShowForm(false);
            setMsg("המעסיק נוסף בהצלחה");
            reload();
          }}
        />
      )}

      {msg && (
        <div className="mb-4">
          <SuccessNote message={msg} />
        </div>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : employers.length === 0 ? (
        <EmptyState message="אין מעסיקים במערכת. הוסף מעסיק כדי לפתוח משרה." />
      ) : (
        <>
          {/* בקשות גישה ממתינות — מעסיקים שנרשמו עצמאית וטרם אושרו (סעיף 6). */}
          {employers.some((e) => e.status === "pending") && (
            <section className="mb-8">
              <h2 className="text-lg font-display text-ink-900 mb-1">
                בקשות גישה ממתינות
              </h2>
              <p className="text-sm text-ink-500 mb-3">
                מעסיקים שנרשמו דרך האתר. לאמת טלפונית ואז לאשר או לדחות.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {employers
                  .filter((e) => e.status === "pending")
                  .map((e) => (
                    <PendingEmployerCard
                      key={e.id}
                      employer={e}
                      onChanged={reload}
                    />
                  ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-display text-ink-900 mb-3">מעסיקים</h2>
            <Card className="mb-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="חיפוש"
                  placeholder="שם חברה / איש קשר / טלפון"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  label="מצב"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "approved" | "rejected",
                    )
                  }
                >
                  <option value="all">הכל</option>
                  <option value="approved">מאושרים</option>
                  <option value="rejected">נדחים</option>
                </Select>
              </div>
            </Card>

            {othersPage.length === 0 ? (
              <EmptyState message="לא נמצאו מעסיקים התואמים לסינון." />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {othersPage.map((e) => (
                  <Card key={e.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg text-ink-900">
                        {e.companyName}
                      </h3>
                      <span className="text-xs text-ink-400">
                        {formatDate(e.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={e.status}
                        label={EMPLOYER_STATUS_LABELS[e.status]}
                      />
                      <span className="inline-block rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-600">
                        {e._count?.jobs ?? 0}{" "}
                        {e._count?.jobs === 1 ? "משרה" : "משרות"}
                      </span>
                    </div>
                    <p className="text-sm text-ink-700">
                      איש קשר: {e.contactName} ·{" "}
                      <PhoneLink phone={e.contactPhone} />
                    </p>
                    <p className="text-sm text-ink-500">
                      <EmailLink email={e.contactEmail} />
                    </p>
                    {e.businessNumber && (
                      <p className="text-xs text-ink-400">
                        ח.פ {e.businessNumber}
                      </p>
                    )}
                    {e.address && (
                      <p className="text-xs text-ink-400">{e.address}</p>
                    )}
                    {e.status === "rejected" && e.rejectionReason && (
                      <p className="text-xs text-red-600">
                        סיבת דחייה: {e.rejectionReason}
                      </p>
                    )}
                    {e.notes && (
                      <p className="text-sm text-ink-700 bg-sand-50 rounded-lg p-2 mt-1">
                        {e.notes}
                      </p>
                    )}
                    <PortalCredentials employer={e} />
                  </Card>
                ))}
              </div>
            )}
            <AdminPager
              page={page}
              totalPages={othersTotalPages}
              onPage={setPage}
            />
          </section>
        </>
      )}
    </div>
  );
}

/** כרטיס בקשת גישה ממתינה — אישור/דחייה ע"י הצוות. */
function PendingEmployerCard({
  employer,
  onChanged,
}: {
  employer: Employer;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const confirm = useConfirm();
  const prompt = usePrompt();

  const approve = async () => {
    if (
      !(await confirm({
        title: "אישור מעסיק",
        message: `לאשר את "${employer.companyName}"? המעסיק יקבל גישה לפורטל ויוכל לפרסם משרות, ויישלח לו מייל אישור.`,
        confirmLabel: "אשר",
      }))
    )
      return;
    setErr("");
    setBusy(true);
    try {
      await approveEmployer(employer.id);
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  const reject = async () => {
    const reason = await prompt({
      title: `דחיית "${employer.companyName}"`,
      message: "אפשר לציין סיבת דחייה (תישלח למעסיק במייל). לא חובה.",
      placeholder: "סיבת הדחייה (אופציונלי)",
      confirmLabel: "דחה",
      multiline: true,
    });
    if (reason === null) return; // ביטול
    setErr("");
    setBusy(true);
    try {
      await rejectEmployer(employer.id, reason || undefined);
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-2 border-s-4 border-s-amber-400">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-900">
          {employer.companyName}
        </h3>
        <span className="text-xs text-ink-400">
          {formatDate(employer.createdAt)}
        </span>
      </div>
      <StatusBadge status="pending" label={EMPLOYER_STATUS_LABELS.pending} />
      <p className="text-sm text-ink-700">
        איש קשר: {employer.contactName} ·{" "}
        <PhoneLink phone={employer.contactPhone} />
      </p>
      <p className="text-sm text-ink-500">
        <EmailLink email={employer.contactEmail} />
      </p>
      {err && <ErrorNote message={err} />}
      <div className="flex gap-2 pt-2 border-t border-sand-100">
        <Button size="sm" onClick={approve} disabled={busy}>
          {busy ? "מעדכן..." : "אישור"}
        </Button>
        <Button size="sm" variant="ghost" onClick={reject} disabled={busy}>
          דחייה
        </Button>
      </div>
    </Card>
  );
}

/** הפקת פרטי כניסה לפורטל המעסיק (סעיף 6) — הצוות בוחר מייל+סיסמה ומוסר למעסיק. */
function PortalCredentials({ employer }: { employer: Employer }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(employer.contactEmail ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    setErr("");
    if (!email || password.length < 8) {
      setErr("נדרש מייל וסיסמה באורך 8 תווים לפחות");
      return;
    }
    setBusy(true);
    try {
      const user = await createPortalUser(employer.id, { email, password });
      setDone(user.email);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-2 border-t border-sand-100">
      {done ? (
        <p className="text-sm text-olive-700 bg-olive-50 rounded-lg p-2">
          ✓ נוצר משתמש פורטל: <b>{done}</b>. מסור למעסיק את המייל והסיסמה יחד עם
          קישור לכניסה לפורטל.
        </p>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-navy-600 hover:underline"
        >
          הפקת פרטי כניסה לפורטל ←
        </button>
      ) : (
        <div className="space-y-2">
          <Input
            label="מייל לכניסה"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <Input
            label="סיסמה (8 תווים לפחות)"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          {err && <ErrorNote message={err} />}
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={busy}>
              {busy ? "יוצר..." : "יצירת משתמש"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    businessNumber: "",
    address: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (
      !form.companyName ||
      !form.contactName ||
      !form.contactPhone ||
      !form.contactEmail
    ) {
      setErr("יש למלא שם חברה, איש קשר, טלפון ומייל");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await createEmployer({
        companyName: form.companyName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        businessNumber: form.businessNumber || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
      });
      setMsg("המעסיק נוסף בהצלחה");
      onCreated();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6 space-y-3">
      <h2 className="text-lg font-display text-ink-900">הוספת מעסיק</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          label="שם החברה *"
          value={form.companyName}
          onChange={(e) => set("companyName")(e.target.value)}
        />
        <Input
          label="ח.פ / מספר עוסק"
          value={form.businessNumber}
          onChange={(e) => set("businessNumber")(e.target.value)}
        />
        <Input
          label="איש קשר *"
          value={form.contactName}
          onChange={(e) => set("contactName")(e.target.value)}
        />
        <Input
          label="טלפון איש קשר *"
          value={form.contactPhone}
          onChange={(e) => set("contactPhone")(e.target.value)}
        />
        <Input
          label="מייל איש קשר *"
          type="email"
          value={form.contactEmail}
          onChange={(e) => set("contactEmail")(e.target.value)}
        />
        <Input
          label="כתובת"
          value={form.address}
          onChange={(e) => set("address")(e.target.value)}
        />
      </div>
      <Textarea
        label="הערות פנימיות (אמינות, העדפות)"
        value={form.notes}
        onChange={(e) => set("notes")(e.target.value)}
      />
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <Button onClick={submit} disabled={busy}>
        {busy ? "שומר..." : "שמירת מעסיק"}
      </Button>
    </Card>
  );
}
