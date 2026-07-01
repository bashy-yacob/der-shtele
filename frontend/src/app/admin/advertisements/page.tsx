"use client";

import { useEffect, useState } from "react";
import {
  listAds,
  createAd,
  updateAd,
  deleteAd,
  uploadAdImage,
  type AdInput,
} from "@/lib/admin-api";
import type { Advertisement, AdPlacement, AdStatus } from "@/types";
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
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/utils";

// פורמט התצוגה ממופה ל-placement הקיים (כדי להימנע ממיגרציה):
// homepage = באנר צד · jobs_list = פופאפ במרכז.
const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  homepage: "באנר צד",
  jobs_list: "פופאפ במרכז",
  footer: "כותרת תחתונה",
};

const FORMAT_OPTIONS: { value: AdPlacement; label: string }[] = [
  { value: "homepage", label: "באנר צד (קבוע בצד שמאל, בכל האתר)" },
  { value: "jobs_list", label: "פופאפ במרכז המסך (פעם בכמה עמודים)" },
];

const STATUS_LABELS: Record<AdStatus, string> = {
  draft: "טיוטה",
  pending_payment: "ממתין לתשלום",
  active: "פעילה",
  paused: "מושהית",
  expired: "פגה",
};

interface FormValues {
  advertiserName: string;
  contactPhone: string;
  contactEmail: string;
  title: string;
  body: string;
  linkUrl: string;
  imagePath: string;
  placement: AdPlacement;
  order: string;
  agreedPrice: string;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: FormValues = {
  advertiserName: "",
  contactPhone: "",
  contactEmail: "",
  title: "",
  body: "",
  linkUrl: "",
  imagePath: "",
  placement: "homepage",
  order: "0",
  agreedPrice: "",
  startDate: "",
  endDate: "",
};

function toForm(a: Advertisement): FormValues {
  return {
    advertiserName: a.advertiserName,
    contactPhone: a.contactPhone,
    contactEmail: a.contactEmail ?? "",
    title: a.title,
    body: a.body ?? "",
    linkUrl: a.linkUrl ?? "",
    imagePath: a.imagePath ?? "",
    placement: a.placement,
    order: String(a.order),
    agreedPrice: a.agreedPrice != null ? String(a.agreedPrice) : "",
    startDate: a.startDate ? a.startDate.slice(0, 10) : "",
    endDate: a.endDate ? a.endDate.slice(0, 10) : "",
  };
}

// ממיר ערכי טופס ל-AdInput לשליחה לבק (מנקה ערכים ריקים, ממיר תאריכים ל-ISO).
function toInput(f: FormValues): AdInput {
  return {
    advertiserName: f.advertiserName.trim(),
    contactPhone: f.contactPhone.trim(),
    contactEmail: f.contactEmail.trim() || undefined,
    title: f.title.trim(),
    body: f.body.trim() || undefined,
    linkUrl: f.linkUrl.trim() || undefined,
    imagePath: f.imagePath || undefined,
    placement: f.placement,
    order: f.order ? Number(f.order) : undefined,
    agreedPrice: f.agreedPrice ? Number(f.agreedPrice) : undefined,
    startDate: f.startDate ? new Date(f.startDate).toISOString() : undefined,
    endDate: f.endDate ? new Date(f.endDate).toISOString() : undefined,
  };
}

export default function AdvertisementsPage() {
  const [items, setItems] = useState<Advertisement[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // הודעת הצלחה ברמת העמוד — נשארת גלויה גם אחרי שהטופס נסגר.
  const [msg, setMsg] = useState("");
  const confirm = useConfirm();

  const reload = () =>
    listAds()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  // עדכון שדה בודד (תשלום/סטטוס) עם עדכון מקומי לאחר אישור השרת.
  async function patch(a: Advertisement, body: Partial<AdInput>) {
    setBusyId(a.id);
    setError("");
    try {
      const updated = await updateAd(a.id, body);
      setItems((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  // הפעלת מודעה — אכיפת כלל הברזל: מודעה עם תמונה מחייבת אישור מפורש שאין בה
  // תמונות אנשים, וכן אזהרה אם טרם סומן תשלום (prepaid).
  async function activate(a: Advertisement) {
    if (
      a.imagePath &&
      !(await confirm({
        title: "הפעלת מודעה עם תמונה",
        message: "אני מאשר שהתמונה אינה כוללת תמונות אנשים (כלל ברזל). להפעיל?",
        confirmLabel: "הפעל",
      }))
    )
      return;
    if (
      a.paymentStatus !== "paid" &&
      !(await confirm({
        title: "המודעה לא שולמה",
        message:
          "המודעה עדיין מסומנת כלא שולמה. להפעיל בכל זאת? (תוצג באתר רק לאחר סימון תשלום)",
        confirmLabel: "הפעל בכל זאת",
      }))
    )
      return;
    await patch(a, { status: "active" });
  }

  async function remove(a: Advertisement) {
    if (
      !(await confirm({
        title: "מחיקת מודעה",
        message: `למחוק את המודעה "${a.title}"? פעולה לא הפיכה.`,
        confirmLabel: "מחק",
        danger: true,
      }))
    )
      return;
    setBusyId(a.id);
    setError("");
    try {
      await deleteAd(a.id);
      setItems((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = items.filter(
    (a) => a.status === "active" && a.paymentStatus === "paid",
  ).length;

  return (
    <div>
      <PageHeader
        title="ניהול פרסומות"
        subtitle={`${items.length} מודעות · ${activeCount} פעילות באתר`}
        action={
          <Button
            onClick={() => {
              setShowForm((s) => !s);
              setEditingId(null);
              setMsg("");
            }}
          >
            {showForm ? "ביטול" : "מודעה חדשה +"}
          </Button>
        }
      />

      <p className="mb-4 rounded-lg border border-olive-300 bg-olive-50 p-3 text-sm text-ink-700">
        מודעה מוצגת באתר רק לאחר סימון תשלום <strong>וגם</strong> הפעלה, ובתוך
        חלון התאריכים. כלל ברזל: ללא תמונות אנשים — כל מודעה מאושרת ידנית.
      </p>

      {msg && (
        <div className="mb-4">
          <SuccessNote message={msg} />
        </div>
      )}

      {showForm && (
        <AdForm
          title="הוספת מודעה"
          initial={EMPTY_FORM}
          submitLabel="שמירת מודעה"
          onSubmit={async (values) => {
            await createAd(toInput(values));
            setShowForm(false);
            setMsg("המודעה נוספה בהצלחה");
            reload();
          }}
        />
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : items.length === 0 ? (
        <EmptyState message="אין מודעות עדיין. הוסף מודעה כדי שתופיע באתר." />
      ) : (
        <div className="space-y-4">
          {items.map((a) =>
            editingId === a.id ? (
              <AdForm
                key={a.id}
                title="עריכת מודעה"
                initial={toForm(a)}
                submitLabel="עדכון מודעה"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const updated = await updateAd(a.id, toInput(values));
                  setItems((prev) =>
                    prev.map((x) => (x.id === a.id ? updated : x)),
                  );
                  setEditingId(null);
                }}
              />
            ) : (
              <Card key={a.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-ink-900">{a.title}</h3>
                  <Pill tone={a.status === "active" ? "good" : "muted"}>
                    {STATUS_LABELS[a.status]}
                  </Pill>
                  <Pill tone={a.paymentStatus === "paid" ? "good" : "warn"}>
                    {a.paymentStatus === "paid" ? "שולם" : "לא שולם"}
                  </Pill>
                  <span className="text-xs text-ink-400">
                    {PLACEMENT_LABELS[a.placement]} · סדר: {a.order}
                  </span>
                </div>

                <p className="text-sm text-ink-500">
                  מפרסם (פנימי): {a.advertiserName} ·{" "}
                  <PhoneLink phone={a.contactPhone} />
                  {a.contactEmail ? (
                    <>
                      {" · "}
                      <EmailLink email={a.contactEmail} />
                    </>
                  ) : null}
                </p>
                {a.body && (
                  <p className="rounded-xl bg-sand-50 p-3 text-sm text-ink-700">
                    {a.body}
                  </p>
                )}
                <p className="text-xs text-ink-400">
                  {a.agreedPrice != null && (
                    <>
                      מחיר: <bdi>{a.agreedPrice} ₪</bdi> ·{" "}
                    </>
                  )}
                  {a.startDate && (
                    <>
                      מ-<bdi>{formatDate(a.startDate)}</bdi>{" "}
                    </>
                  )}
                  {a.endDate && (
                    <>
                      עד <bdi>{formatDate(a.endDate)}</bdi>
                    </>
                  )}
                  {a.paidAt && (
                    <>
                      {" · "}שולם: <bdi>{formatDate(a.paidAt)}</bdi>
                    </>
                  )}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(a.id);
                      setShowForm(false);
                    }}
                  >
                    עריכה
                  </Button>
                  {a.paymentStatus !== "paid" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === a.id}
                      onClick={() => patch(a, { paymentStatus: "paid" })}
                    >
                      סימון כשולם
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === a.id}
                      onClick={() => patch(a, { paymentStatus: "unpaid" })}
                    >
                      ביטול תשלום
                    </Button>
                  )}
                  {a.status !== "active" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === a.id}
                      onClick={() => activate(a)}
                    >
                      הפעלה
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === a.id}
                      onClick={() => patch(a, { status: "paused" })}
                    >
                      השהיה
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === a.id}
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => remove(a)}
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
  tone: "good" | "warn" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "good"
      ? "bg-olive-100 text-olive-700"
      : tone === "warn"
        ? "bg-amber-100 text-amber-800"
        : "bg-sand-200 text-ink-500";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function AdForm({
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
      const { path } = await uploadAdImage(file);
      setForm((f) => ({ ...f, imagePath: path }));
      setMsg("התמונה הועלתה");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const submit = async () => {
    if (form.advertiserName.trim().length < 2) {
      setErr("יש למלא שם מפרסם (לפחות 2 תווים)");
      return;
    }
    if (form.contactPhone.trim().length < 2) {
      setErr("יש למלא טלפון איש קשר");
      return;
    }
    if (form.title.trim().length < 2) {
      setErr("יש למלא כותרת (לפחות 2 תווים)");
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
      <h2 className="text-lg font-display text-ink-900">{title}</h2>

      {/* בלוק פנימי — פרטי מפרסם (לא מוצגים באתר) */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-3 space-y-3">
        <p className="text-xs font-semibold text-navy-700">
          פרטי מפרסם (פנימי — לא מוצג באתר)
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <Input
            label="שם המפרסם *"
            value={form.advertiserName}
            onChange={(e) => set("advertiserName")(e.target.value)}
          />
          <Input
            label="טלפון *"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone")(e.target.value)}
          />
          <Input
            label="מייל"
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail")(e.target.value)}
          />
        </div>
      </div>

      {/* תוכן המודעה (גלוי באתר) */}
      <Input
        label="כותרת המודעה *"
        value={form.title}
        onChange={(e) => set("title")(e.target.value)}
      />
      <Textarea
        label="טקסט קצר"
        rows={3}
        value={form.body}
        onChange={(e) => set("body")(e.target.value)}
      />
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          label="קישור בלחיצה (אופציונלי)"
          placeholder="https://..."
          value={form.linkUrl}
          onChange={(e) => set("linkUrl")(e.target.value)}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-700">
            תמונת באנר (ללא תמונות אנשים)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-sm text-ink-500 file:me-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-navy-700"
          />
          {uploading && (
            <p className="mt-1 text-xs text-ink-400">מעלה תמונה...</p>
          )}
          {form.imagePath && !uploading && (
            <p className="mt-1 text-xs text-olive-700">✓ תמונה הועלתה</p>
          )}
        </div>
      </div>

      {/* פורמט תצוגה, סדר, מחיר */}
      <div className="grid md:grid-cols-3 gap-3">
        <Select
          label="פורמט תצוגה"
          value={form.placement}
          onChange={(e) => set("placement")(e.target.value)}
        >
          {/* אם ל-מודעה קיימת placement ישן (footer) שאינו ברשימת הפורמטים —
              מוסיפים אותו כאופציה כדי לא לאפס אותו בשקט בעריכה. */}
          {(FORMAT_OPTIONS.some((o) => o.value === form.placement)
            ? FORMAT_OPTIONS
            : [
                ...FORMAT_OPTIONS,
                {
                  value: form.placement,
                  label: PLACEMENT_LABELS[form.placement] ?? form.placement,
                },
              ]
          ).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Input
          label="סדר תצוגה"
          type="number"
          value={form.order}
          onChange={(e) => set("order")(e.target.value)}
        />
        <Input
          label="מחיר מוסכם (₪ — פנימי)"
          type="number"
          value={form.agreedPrice}
          onChange={(e) => set("agreedPrice")(e.target.value)}
        />
      </div>
      <p className="rounded-lg bg-sand-50 p-2 text-xs text-ink-500">
        כשיש כמה מודעות באותו פורמט — מוצגת זו עם <strong>סדר התצוגה</strong>{" "}
        הנמוך ביותר.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          label="מתאריך (אופציונלי)"
          type="date"
          value={form.startDate}
          onChange={(e) => set("startDate")(e.target.value)}
        />
        <Input
          label="עד תאריך (אופציונלי)"
          type="date"
          value={form.endDate}
          onChange={(e) => set("endDate")(e.target.value)}
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
