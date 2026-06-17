"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listEmployers, createJob, updateJob } from "@/lib/admin-api";
import type { Employer, JobField, Region } from "@/types";
import { ErrorNote, PageHeader, Loading } from "@/components/admin/Feedback";
import { Card, Button, Input, Select, Textarea } from "@/components/ui";
import { FIELD_LABELS, REGION_LABELS, SCOPE_OPTIONS } from "@/lib/labels";

export default function NewJobPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    listEmployers()
      .then(setEmployers)
      .catch((e) => setErr(e.message))
      .finally(() => setLoadingEmployers(false));
  }, []);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

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

      {employers.length === 0 ? (
        <ErrorNote message="אין מעסיקים במערכת. יש להוסיף מעסיק לפני יצירת משרה." />
      ) : (
        <Card className="space-y-4">
          <Select
            label="מעסיק *"
            value={form.employerId}
            onChange={(e) => set("employerId")(e.target.value)}
          >
            <option value="">— בחר מעסיק —</option>
            {employers.map((e) => (
              <option key={e.id} value={e.id}>
                {e.companyName}
              </option>
            ))}
          </Select>

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
            <Select
              label="אזור *"
              value={form.region}
              onChange={(e) => set("region")(e.target.value)}
            >
              <option value="">— בחר —</option>
              {Object.entries(REGION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
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
          <Button onClick={submit} disabled={busy}>
            {busy ? "שומר..." : "שמירת משרה"}
          </Button>
        </Card>
      )}
    </div>
  );
}
