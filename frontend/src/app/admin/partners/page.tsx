"use client";

import { useEffect, useState } from "react";
import {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  uploadPartnerLogo,
  type PartnerInput,
} from "@/lib/partners-api";
import type { Partner } from "@/types";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input } from "@/components/ui";
import { useConfirm } from "@/components/admin/ConfirmDialog";

interface FormValues {
  partnerName: string;
  logoPath: string;
  logoUrl: string; // תצוגה מקדימה בלבד (לא נשלח)
  linkUrl: string;
  displayOrder: string;
}

const EMPTY_FORM: FormValues = {
  partnerName: "",
  logoPath: "",
  logoUrl: "",
  linkUrl: "",
  displayOrder: "0",
};

function toForm(p: Partner): FormValues {
  return {
    partnerName: p.partnerName,
    logoPath: p.logoPath,
    logoUrl: p.logoUrl,
    linkUrl: p.linkUrl ?? "",
    displayOrder: String(p.displayOrder),
  };
}

// ממיר ערכי טופס ל-PartnerInput (מנקה ערכים ריקים).
function toInput(f: FormValues): PartnerInput {
  return {
    partnerName: f.partnerName.trim(),
    logoPath: f.logoPath,
    linkUrl: f.linkUrl.trim() || undefined,
    displayOrder: f.displayOrder ? Number(f.displayOrder) : undefined,
  };
}

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const confirm = useConfirm();

  const reload = () =>
    listPartners()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  // עדכון שדה בודד (הצגה/הסתרה) עם עדכון מקומי לאחר אישור השרת.
  async function patch(p: Partner, body: Partial<PartnerInput>) {
    setBusyId(p.id);
    setError("");
    try {
      const updated = await updatePartner(p.id, body);
      setItems((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Partner) {
    if (
      !(await confirm({
        title: "מחיקת שותף",
        message: `למחוק את הלוגו של "${p.partnerName}"? פעולה לא הפיכה.`,
        confirmLabel: "מחק",
        danger: true,
      }))
    )
      return;
    setBusyId(p.id);
    setError("");
    try {
      await deletePartner(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = items.filter((p) => p.isActive).length;

  return (
    <div>
      <PageHeader
        title="ניהול שותפים"
        subtitle={`${items.length} לוגואים · ${activeCount} מוצגים באתר`}
        action={
          <Button
            onClick={() => {
              setShowForm((s) => !s);
              setEditingId(null);
              setMsg("");
            }}
          >
            {showForm ? "ביטול" : "שותף חדש +"}
          </Button>
        }
      />

      <p className="mb-4 rounded-lg border border-olive-300 bg-olive-50 p-3 text-sm text-ink-700">
        סקשן &quot;עם מי אנחנו עובדים&quot; — מוסיפים לוגו אחד-אחד ככל שמעסיק
        מסכים. כלל ברזל: <strong>לוגו בלבד — ללא תמונות אנשים/פנים</strong>. מוצג
        באתר רק כשמסומן &quot;מוצג&quot;. סדר תצוגה נמוך = מופיע ראשון.
      </p>

      {msg && (
        <div className="mb-4">
          <SuccessNote message={msg} />
        </div>
      )}

      {showForm && (
        <PartnerForm
          title="הוספת שותף"
          initial={EMPTY_FORM}
          submitLabel="שמירת שותף"
          onSubmit={async (values) => {
            await createPartner(toInput(values));
            setShowForm(false);
            setMsg("השותף נוסף בהצלחה");
            reload();
          }}
        />
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : items.length === 0 ? (
        <EmptyState message="אין שותפים עדיין. הוסף לוגו כדי שיופיע באתר." />
      ) : (
        <div className="space-y-4">
          {items.map((p) =>
            editingId === p.id ? (
              <PartnerForm
                key={p.id}
                title="עריכת שותף"
                initial={toForm(p)}
                submitLabel="עדכון שותף"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const updated = await updatePartner(p.id, toInput(values));
                  setItems((prev) =>
                    prev.map((x) => (x.id === p.id ? updated : x)),
                  );
                  setEditingId(null);
                }}
              />
            ) : (
              <Card key={p.id} className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-sand-200 bg-white p-2">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logoUrl}
                      alt={p.partnerName}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-ink-400">אין לוגו</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-ink-900">{p.partnerName}</h3>
                    <Pill tone={p.isActive ? "good" : "muted"}>
                      {p.isActive ? "מוצג" : "מוסתר"}
                    </Pill>
                    <span className="text-xs text-ink-400">
                      סדר: {p.displayOrder}
                    </span>
                  </div>
                  {p.linkUrl && (
                    <p className="mt-1 truncate text-xs text-ink-400">
                      <bdi dir="ltr">{p.linkUrl}</bdi>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(p.id);
                      setShowForm(false);
                    }}
                  >
                    עריכה
                  </Button>
                  <Button
                    size="sm"
                    variant={p.isActive ? "ghost" : "secondary"}
                    disabled={busyId === p.id}
                    onClick={() => patch(p, { isActive: !p.isActive })}
                  >
                    {p.isActive ? "הסתרה" : "הצגה"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === p.id}
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => remove(p)}
                  >
                    מחיקה
                  </Button>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "good" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "good"
      ? "bg-olive-100 text-olive-700"
      : "bg-sand-200 text-ink-500";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function PartnerForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: FormValues;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const set = (k: keyof FormValues) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const { path } = await uploadPartnerLogo(file);
      // תצוגה מקדימה מיידית מהקובץ המקומי (עד לרענון מהשרת).
      const preview = URL.createObjectURL(file);
      setForm((f) => ({ ...f, logoPath: path, logoUrl: preview }));
      setMsg("הלוגו הועלה");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const submit = async () => {
    if (form.partnerName.trim().length < 2) {
      setErr("יש למלא שם שותף (לפחות 2 תווים)");
      return;
    }
    if (!form.logoPath) {
      setErr("יש להעלות לוגו");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await onSubmit(form);
      setMsg("נשמר בהצלחה");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6 space-y-3">
      <h2 className="font-display text-lg text-ink-900">{title}</h2>

      <Input
        label="שם השותף *"
        placeholder="שם החנות / המעסיק"
        value={form.partnerName}
        onChange={(e) => set("partnerName")(e.target.value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-700">
            לוגו * (ללא תמונות אנשים)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-sm text-ink-500 file:me-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-navy-700"
          />
          {uploading && (
            <p className="mt-1 text-xs text-ink-400">מעלה לוגו...</p>
          )}
          {form.logoUrl && !uploading && (
            <div className="mt-2 flex h-14 w-24 items-center justify-center rounded-lg border border-sand-200 bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl}
                alt="תצוגה מקדימה"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>
        <Input
          label="קישור בלחיצה (אופציונלי)"
          placeholder="https://..."
          value={form.linkUrl}
          onChange={(e) => set("linkUrl")(e.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="סדר תצוגה (נמוך = ראשון)"
          type="number"
          value={form.displayOrder}
          onChange={(e) => set("displayOrder")(e.target.value)}
        />
      </div>

      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={busy || uploading}>
          {busy ? "שומר..." : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            ביטול
          </Button>
        )}
      </div>
    </Card>
  );
}
