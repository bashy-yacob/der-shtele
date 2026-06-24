"use client";

// פרסום משרה ע"י מעסיק. נשמרת כ-pending עד אישור הצוות.
// תיאור ציבורי (אנונימי, עולה לאתר) נפרד מתיאור פנימי (דרישות מלאות, פנימי).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  CityCombobox,
} from "@/components/ui";
import { createPortalJob } from "@/lib/portal-api";
import {
  FIELD_LABELS,
  SCOPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  buildCityOptions,
} from "@/lib/labels";
import type { JobField } from "@/types";

export default function NewPortalJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [descriptionPublic, setDescriptionPublic] = useState("");
  const [descriptionInternal, setDescriptionInternal] = useState("");
  const [field, setField] = useState<JobField | "">("");
  const [region, setRegion] = useState("");
  const [scope, setScope] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/jobs/regions")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setCityOptions(buildCityOptions(j.data));
      })
      .catch(() => undefined);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !descriptionPublic || !descriptionInternal || !field || !region || !scope) {
      setError("נא למלא את כל שדות החובה (*).");
      return;
    }
    setSubmitting(true);
    try {
      await createPortalJob({
        title,
        descriptionPublic,
        descriptionInternal,
        field: field as JobField,
        region,
        scope,
        experience: experience || undefined,
        salary: salary || undefined,
      });
      router.replace("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בפרסום המשרה");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">פרסום משרה</h1>

      <Card>
        <p className="text-sm text-ink-500 mb-5 leading-relaxed">
          המשרה תועבר לאישור הצוות לפני שתעלה לאתר. התיאור הציבורי הוא הטקסט
          האנונימי שגולשים יראו; התיאור הפנימי והשכר נשמרים אצל הצוות בלבד.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            id="title"
            label="שם התפקיד *"
            placeholder="לדוגמה: מנהל/ת חשבונות"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            id="descriptionPublic"
            label="תיאור ציבורי (אנונימי) *"
            rows={4}
            placeholder="תיאור כללי של התפקיד — בלי שם החברה ובלי פרטים מזהים"
            value={descriptionPublic}
            onChange={(e) => setDescriptionPublic(e.target.value)}
          />

          <Textarea
            id="descriptionInternal"
            label="תיאור פנימי מלא (לצוות בלבד) *"
            rows={4}
            placeholder="דרישות מפורטות, תנאים, הערות — לא יעלה לאתר"
            value={descriptionInternal}
            onChange={(e) => setDescriptionInternal(e.target.value)}
          />

          <Select
            id="field"
            label="תחום *"
            value={field}
            onChange={(e) => setField(e.target.value as JobField | "")}
          >
            <option value="">בחר/י תחום...</option>
            {Object.entries(FIELD_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>

          <CityCombobox
            id="region"
            label="אזור *"
            options={cityOptions}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />

          <Select
            id="scope"
            label="היקף משרה *"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="">בחר/י היקף...</option>
            {SCOPE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Select
            id="experience"
            label="ניסיון נדרש (אופציונלי)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">ללא דרישת ניסיון ספציפית</option>
            {EXPERIENCE_OPTIONS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>

          <Input
            id="salary"
            label="שכר מוצע (פנימי, אופציונלי)"
            placeholder="לדוגמה: 8,000–10,000 ₪"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "מפרסם..." : "פרסום משרה לאישור"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.replace("/portal")}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
