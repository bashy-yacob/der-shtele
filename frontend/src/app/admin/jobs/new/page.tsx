"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  listEmployers,
  createJob,
  updateJob,
  createEmployer,
  listRegions,
} from "@/lib/admin-api";
import type { Employer, JobField, Region } from "@/types";
import {
  ErrorNote,
  SuccessNote,
  PageHeader,
  Loading,
} from "@/components/admin/Feedback";
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  CityCombobox,
} from "@/components/ui";
import { FIELD_LABELS, SCOPE_OPTIONS, buildCityOptions } from "@/lib/labels";

export default function NewJobPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());

  const [form, setForm] = useState({
    employerId: "",
    title: "",
    descriptionPublic: "",
    descriptionInternal: "",
    field: "" as JobField | "",
    region: "" as Region | "",
    scope: SCOPE_OPTIONS[0] as string,
  });
  const [publishNow, setPublishNow] = useState(false);
  // פרטי מעסיק שהגיעו מפנייה (?company=...&contactName=...&phone=...) לטעינת הטופס המוטמע
  const [employerPrefill, setEmployerPrefill] = useState<{
    companyName?: string;
    contactName?: string;
    contactPhone?: string;
  } | null>(null);

  useEffect(() => {
    listEmployers()
      .then((list) => {
        setEmployers(list);
        // אם אין מעסיקים — פותחים מיד את הטופס המוטמע כדי לא לתקוע את הזרימה
        if (list.length === 0) setShowEmployerForm(true);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoadingEmployers(false));
    listRegions()
      .then((r) => setCityOptions(buildCityOptions(r)))
      .catch(() => undefined);
  }, []);

  // טעינה מראש מתוך פניית מעסיק (מ-/admin/contacts → "צור משרה מפנייה זו").
  // קוראים מ-window.location.search כדי לא לחייב Suspense (useSearchParams).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (!q.toString()) return;

    const field = q.get("field") as JobField | null;
    const scope = q.get("scope") ?? "";
    const description = q.get("description") ?? "";
    setForm((f) => ({
      ...f,
      field: field ?? f.field,
      region: q.get("region") ?? f.region,
      scope: (SCOPE_OPTIONS as readonly string[]).includes(scope)
        ? scope
        : f.scope,
      // התיאור מהפנייה משמש בסיס לשני התיאורים; את הציבורי יש לאנונימז ידנית
      descriptionInternal: description || f.descriptionInternal,
      descriptionPublic: description || f.descriptionPublic,
    }));

    const companyName = q.get("company");
    const contactName = q.get("contactName");
    const contactPhone = q.get("phone");
    if (companyName || contactName || contactPhone) {
      setEmployerPrefill({
        companyName: companyName ?? undefined,
        contactName: contactName ?? undefined,
        contactPhone: contactPhone ?? undefined,
      });
      setShowEmployerForm(true);
    }
  }, []);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // נקרא כשנוצר מעסיק חדש מתוך הטופס המוטמע — מוסיף לרשימה ובוחר אותו אוטומטית
  const onEmployerCreated = (employer: Employer) => {
    setEmployers((prev) => [employer, ...prev]);
    setForm((f) => ({ ...f, employerId: employer.id }));
    setShowEmployerForm(false);
  };

  const submit = async () => {
    if (
      !form.employerId ||
      form.title.trim().length < 2 ||
      form.descriptionPublic.trim().length < 10 ||
      !form.descriptionInternal ||
      !form.field ||
      !form.region
    ) {
      setErr(
        "יש למלא מעסיק, תפקיד, תיאור ציבורי (10 תווים+), תיאור פנימי, תחום ואזור",
      );
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const job = await createJob({
        employerId: form.employerId,
        title: form.title,
        descriptionPublic: form.descriptionPublic,
        descriptionInternal: form.descriptionInternal,
        field: form.field as JobField,
        region: form.region as Region,
        scope: form.scope,
      });
      // אישור לפני פרסום: משרה חדשה נשמרת כטיוטה (מושהית) אלא אם נבחר לפרסם מיד.
      if (!publishNow) {
        await updateJob(job.id, { status: "paused" });
      }
      router.push(`/admin/jobs/${job.id}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  if (loadingEmployers) return <Loading />;

  return (
    <div>
      <PageHeader
        title="משרה חדשה"
        subtitle="הפרדה בין מידע פנימי לתיאור ציבורי"
      />
      <Link
        href="/admin/jobs"
        className="text-sm text-navy-600 hover:underline mb-4 inline-block"
      >
        → חזרה לרשימת המשרות
      </Link>

      <Card className="space-y-4">
        {/* מעסיק — בחירה מהרשימה או הוספה מהירה כאן */}
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="מעסיק *"
                value={form.employerId}
                onChange={(e) => set("employerId")(e.target.value)}
                disabled={showEmployerForm}
              >
                <option value="">— בחר מעסיק —</option>
                {employers.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.companyName}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              size="sm"
              variant={showEmployerForm ? "ghost" : "outline"}
              onClick={() => setShowEmployerForm((s) => !s)}
            >
              {showEmployerForm ? "ביטול" : "מעסיק חדש +"}
            </Button>
          </div>

          {showEmployerForm && (
            <InlineEmployerForm
              onCreated={onEmployerCreated}
              onCancel={() => setShowEmployerForm(false)}
              showCancel={employers.length > 0}
              initial={employerPrefill}
            />
          )}
        </div>

        <Input
          label="שם התפקיד *"
          value={form.title}
          onChange={(e) => set("title")(e.target.value)}
        />

        <div className="grid md:grid-cols-3 gap-3">
          <Select
            label="תחום *"
            value={form.field}
            onChange={(e) => set("field")(e.target.value)}
          >
            <option value="">— בחר —</option>
            {Object.entries(FIELD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <CityCombobox
            label="עיר / אזור *"
            options={cityOptions}
            value={form.region}
            onChange={(e) => set("region")(e.target.value)}
          />
          <Select
            label="היקף משרה *"
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

        <div className="rounded-xl border border-olive-300 bg-olive-50 p-3">
          <Textarea
            label="תיאור ציבורי (אנונימי — עולה לאתר) *"
            value={form.descriptionPublic}
            onChange={(e) => set("descriptionPublic")(e.target.value)}
            placeholder="ללא שם מעסיק או פרטים מזהים"
          />
        </div>

        <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-3">
          <Textarea
            label="תיאור פנימי (דרישות מלאות — לא חשוף) *"
            value={form.descriptionInternal}
            onChange={(e) => set("descriptionInternal")(e.target.value)}
            placeholder="דרישות מפורטות, תנאים, הערות פנימיות"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
            className="w-4 h-4 accent-navy-600"
          />
          פרסם מיד באתר (אחרת תישמר כטיוטה מושהית לאישור)
        </label>

        {err && <ErrorNote message={err} />}
        <Button onClick={submit} disabled={busy || showEmployerForm}>
          {busy ? "שומר..." : "שמירת משרה"}
        </Button>
      </Card>
    </div>
  );
}

// טופס מעסיק מוטמע — נפתח מתוך טופס המשרה כשחסר מעסיק
function InlineEmployerForm({
  onCreated,
  onCancel,
  showCancel,
  initial,
}: {
  onCreated: (e: Employer) => void;
  onCancel: () => void;
  showCancel: boolean;
  initial?: {
    companyName?: string;
    contactName?: string;
    contactPhone?: string;
  } | null;
}) {
  const [f, setF] = useState({
    companyName: initial?.companyName ?? "",
    contactName: initial?.contactName ?? "",
    contactPhone: initial?.contactPhone ?? "",
    contactEmail: "",
    businessNumber: "",
    address: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof f) => (v: string) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (
      !f.companyName ||
      !f.contactName ||
      !f.contactPhone ||
      !f.contactEmail
    ) {
      setErr("יש למלא שם חברה, איש קשר, טלפון ומייל");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const employer = await createEmployer({
        companyName: f.companyName,
        contactName: f.contactName,
        contactPhone: f.contactPhone,
        contactEmail: f.contactEmail,
        businessNumber: f.businessNumber || undefined,
        address: f.address || undefined,
        notes: f.notes || undefined,
      });
      setMsg("המעסיק נוסף ונבחר");
      onCreated(employer);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-sand-300 bg-sand-50 p-3 space-y-3">
      <p className="text-sm font-semibold text-ink-700">מעסיק חדש (פנימי)</p>
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          label="שם החברה *"
          value={f.companyName}
          onChange={(e) => set("companyName")(e.target.value)}
        />
        <Input
          label="ח.פ / מספר עוסק"
          value={f.businessNumber}
          onChange={(e) => set("businessNumber")(e.target.value)}
        />
        <Input
          label="איש קשר *"
          value={f.contactName}
          onChange={(e) => set("contactName")(e.target.value)}
        />
        <Input
          label="טלפון *"
          value={f.contactPhone}
          onChange={(e) => set("contactPhone")(e.target.value)}
        />
        <Input
          label="מייל *"
          type="email"
          value={f.contactEmail}
          onChange={(e) => set("contactEmail")(e.target.value)}
        />
        <Input
          label="כתובת"
          value={f.address}
          onChange={(e) => set("address")(e.target.value)}
        />
      </div>
      <Textarea
        label="הערות פנימיות"
        value={f.notes}
        onChange={(e) => set("notes")(e.target.value)}
      />
      {err && <ErrorNote message={err} />}
      {msg && <SuccessNote message={msg} />}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "שומר..." : "שמירת מעסיק"}
        </Button>
        {showCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            ביטול
          </Button>
        )}
      </div>
    </div>
  );
}
