"use client";

import { useEffect, useState } from "react";
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/admin-api";
import type { Testimonial } from "@/types";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input, Textarea } from "@/components/ui";
import { useConfirm } from "@/components/admin/ConfirmDialog";

// ערכי טופס משותפים ליצירה ולעריכה.
interface FormValues {
  authorName: string;
  authorRole: string;
  quote: string;
  order: string;
  published: boolean;
}

const EMPTY_FORM: FormValues = {
  authorName: "",
  authorRole: "",
  quote: "",
  order: "0",
  published: true,
};

function toForm(t: Testimonial): FormValues {
  return {
    authorName: t.authorName,
    authorRole: t.authorRole ?? "",
    quote: t.quote,
    order: String(t.order),
    published: t.published,
  };
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // הודעת הצלחה ברמת העמוד — נשארת גלויה גם אחרי שהטופס נסגר.
  const [msg, setMsg] = useState("");
  const confirm = useConfirm();

  const reload = () =>
    listTestimonials()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  // החלפת מצב "מפורסם" — עדכון מקומי לאחר אישור השרת.
  async function togglePublished(t: Testimonial) {
    setBusyId(t.id);
    setError("");
    try {
      const updated = await updateTestimonial(t.id, {
        published: !t.published,
      });
      setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(t: Testimonial) {
    if (
      !(await confirm({
        title: "מחיקת המלצה",
        message: `למחוק את ההמלצה של ${t.authorName}? פעולה לא הפיכה.`,
        confirmLabel: "מחק",
        danger: true,
      }))
    )
      return;
    setBusyId(t.id);
    setError("");
    try {
      await deleteTestimonial(t.id);
      setItems((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const publishedCount = items.filter((t) => t.published).length;

  return (
    <div>
      <PageHeader
        title="ניהול המלצות"
        subtitle={`${items.length} המלצות · ${publishedCount} מפורסמות בדף הבית`}
        action={
          <Button
            onClick={() => {
              setShowForm((s) => !s);
              setEditingId(null);
              setMsg("");
            }}
          >
            {showForm ? "ביטול" : "המלצה חדשה +"}
          </Button>
        }
      />

      {showForm && (
        <TestimonialForm
          title="הוספת המלצה"
          initial={EMPTY_FORM}
          submitLabel="שמירת המלצה"
          onSubmit={async (values) => {
            await createTestimonial(values);
            setShowForm(false);
            setMsg("ההמלצה נוספה בהצלחה");
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
      ) : items.length === 0 ? (
        <EmptyState message="אין המלצות עדיין. הוסף המלצה כדי שתופיע בדף הבית." />
      ) : (
        <div className="space-y-4">
          {items.map((t) =>
            editingId === t.id ? (
              <TestimonialForm
                key={t.id}
                title="עריכת המלצה"
                initial={toForm(t)}
                submitLabel="עדכון המלצה"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const updated = await updateTestimonial(t.id, values);
                  setItems((prev) =>
                    prev.map((x) => (x.id === t.id ? updated : x)),
                  );
                  setEditingId(null);
                }}
              />
            ) : (
              <Card key={t.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ink-900">{t.authorName}</h3>
                      <span
                        className={
                          t.published
                            ? "text-xs font-semibold px-2 py-0.5 rounded-full bg-olive-100 text-olive-700"
                            : "text-xs font-semibold px-2 py-0.5 rounded-full bg-sand-200 text-ink-500"
                        }
                      >
                        {t.published ? "מפורסמת" : "מוסתרת"}
                      </span>
                      <span className="text-xs text-ink-400">
                        סדר: {t.order}
                      </span>
                    </div>
                    {t.authorRole && (
                      <p className="text-sm text-ink-500 mt-0.5">
                        {t.authorRole}
                      </p>
                    )}
                  </div>
                </div>

                <blockquote className="text-ink-700 leading-relaxed bg-sand-50 rounded-xl p-3 text-sm">
                  {t.quote}
                </blockquote>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(t.id);
                      setShowForm(false);
                    }}
                  >
                    עריכה
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === t.id}
                    onClick={() => togglePublished(t)}
                  >
                    {t.published ? "הסתרה" : "פרסום"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === t.id}
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => remove(t)}
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

function TestimonialForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: FormValues;
  submitLabel: string;
  onSubmit: (values: {
    authorName: string;
    quote: string;
    authorRole?: string;
    published?: boolean;
    order?: number;
  }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const set = (k: keyof FormValues) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (form.authorName.trim().length < 2) {
      setErr("יש למלא שם (לפחות 2 תווים)");
      return;
    }
    if (form.quote.trim().length < 10) {
      setErr("ההמלצה חייבת להיות לפחות 10 תווים");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await onSubmit({
        authorName: form.authorName.trim(),
        quote: form.quote.trim(),
        authorRole: form.authorRole.trim() || undefined,
        published: form.published,
        order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
      });
      setMsg("נשמר בהצלחה");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6 space-y-3">
      <h2 className="text-lg font-display text-ink-900">{title}</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          label="שם פרטי / ראשי תיבות *"
          placeholder="לדוגמה: י.כ."
          value={form.authorName}
          onChange={(e) => set("authorName")(e.target.value)}
        />
        <Input
          label="תיאור / הקשר"
          placeholder="לדוגמה: הושם כמנהל לוגיסטיקה"
          value={form.authorRole}
          onChange={(e) => set("authorRole")(e.target.value)}
        />
      </div>
      <Textarea
        label="תוכן ההמלצה *"
        rows={4}
        value={form.quote}
        onChange={(e) => set("quote")(e.target.value)}
      />
      <div className="flex items-center gap-6 flex-wrap">
        <Input
          label="סדר תצוגה"
          type="number"
          className="max-w-[8rem]"
          value={form.order}
          onChange={(e) => set("order")(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-700 cursor-pointer mt-6">
          <input
            type="checkbox"
            className="w-4 h-4 accent-navy-600"
            checked={form.published}
            onChange={(e) => set("published")(e.target.checked)}
          />
          מפורסמת בדף הבית
        </label>
      </div>
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={busy}>
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
