"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FIELD_LABELS, buildCityOptions, SITE_CONTENT } from "@/lib/constants";
import { phoneSchema } from "@/lib/validations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button, Card, Input, CityCombobox } from "@/components/ui";

const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const applicationSchema = z.object({
  fullName: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  phone: phoneSchema,
  email: z.string().email("כתובת דואר אלקטרוני לא תקינה"),
  field: z.string().min(1, "בחרו תחום"),
  region: z.string().min(1, "בחרו אזור"),
  notes: z.string().optional(),
  resume: z
    .any()
    .refine((f) => f && f.length > 0, "יש לצרף קורות חיים")
    .refine(
      (f) => !f?.[0] || f[0].size <= 5 * 1024 * 1024,
      "קובץ גדול מדי (עד 5MB)",
    )
    .refine(
      (f) => !f?.[0] || ALLOWED_CV_TYPES.includes(f[0].type),
      "פורמט קובץ לא נתמך (רק PDF או Word)",
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export default function ApplicationForm({
  jobId,
  jobTitle,
}: ApplicationFormProps) {
  const { user, loading, getToken } = useAuth();
  const pathname = usePathname();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());

  // רשימת הערים הקיימות (same-origin proxy → לא נחסם ע"י NetFree). נכשל בעדינות.
  useEffect(() => {
    fetch("/api/jobs/regions")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setCityOptions(buildCityOptions(j.data));
      })
      .catch(() => undefined);
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setError(null);
      const authHeader = `Bearer ${getToken() ?? ""}`;

      // שלב 1: העלאת קו"ח דרך ה-proxy → קבלת path לאחסון
      const fileList = data.resume as FileList;
      const fd = new FormData();
      fd.append("resume", fileList[0]);
      const upRes = await fetch("/api/candidates/resume", {
        method: "POST",
        headers: { Authorization: authHeader },
        body: fd,
      });
      if (!upRes.ok) throw new Error("שגיאה בהעלאת קורות החיים");
      const upJson = await upRes.json();
      const cvPath = upJson?.data?.path ?? upJson?.path;

      // שלב 2: שליחת ההגשה עם הנתיב (בלי ה-FileList — ה-API דוחה שדות לא מוכרים)
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          field: data.field,
          region: data.region,
          notes: data.notes,
          jobId,
          cvPath,
        }),
      });

      if (!response.ok) throw new Error("שגיאה בשליחה");

      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "אירעה שגיאה. נא לנסות שוב.",
      );
    }
  };

  // שער כניסה: הגשת מועמדות מחייבת התחברות (לפי האיפיון — אין הגשה אנונימית).
  if (loading) {
    return <Card className="text-center text-ink-500">טוען...</Card>;
  }

  if (!user) {
    return (
      <Card>
        <h2 className="font-display text-xl font-bold text-ink-900 mb-3">
          הגשת מועמדות
        </h2>
        <p className="text-sm text-ink-700 mb-4">
          כדי לשלוח קורות חיים יש להתחבר או להירשם. ההרשמה מאפשרת לעקוב אחר
          ההגשות שלך.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="block"
        >
          <Button className="w-full">התחברות / הרשמה</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <h2 className="font-display text-xl font-bold text-ink-900 mb-6">
        הגשת מועמדות
      </h2>

      {submitted && (
        <div className="bg-olive-50 border border-olive-300 rounded-xl p-4 mb-6">
          <p className="text-olive-700 font-medium text-sm">
            {SITE_CONTENT.messages.success.candidate}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <Input
          {...register("fullName")}
          type="text"
          id="fullName"
          label="שם מלא *"
          placeholder="שמך"
          error={errors.fullName?.message}
        />

        {/* Phone */}
        <Input
          {...register("phone")}
          type="tel"
          id="phone"
          label="טלפון *"
          placeholder="050-0000000"
          error={errors.phone?.message}
        />

        {/* Email */}
        <Input
          {...register("email")}
          type="email"
          id="email"
          label="דואר אלקטרוני *"
          placeholder="example@mail.com"
          error={errors.email?.message}
        />

        {/* Field */}
        <div>
          <label
            htmlFor="field"
            className="block text-sm font-semibold text-ink-700 mb-1.5"
          >
            תחום מבוקש *
          </label>
          <select
            {...register("field")}
            id="field"
            className="w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
          >
            <option value="">בחרו...</option>
            {Object.entries(FIELD_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {errors.field && (
            <p className="text-red-600 text-xs mt-1">{errors.field.message}</p>
          )}
        </div>

        {/* Region / City */}
        <CityCombobox
          {...register("region")}
          id="region"
          label="עיר / אזור מועדף *"
          options={cityOptions}
          error={errors.region?.message}
        />

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-ink-700 mb-1.5"
          >
            הערות (אופציונלי)
          </label>
          <textarea
            {...register("notes")}
            id="notes"
            rows={3}
            placeholder="כל מידע נוסף שרלוונטי..."
            className="w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Resume Upload */}
        <div className="rounded-xl border border-olive-300 bg-olive-50 p-4">
          <label
            htmlFor="resume"
            className="block text-sm font-semibold text-olive-700 mb-1.5"
          >
            קורות חיים (PDF או Word) *
          </label>
          <input
            {...register("resume")}
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            className="w-full text-sm text-ink-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-olive-100 file:text-olive-700 hover:file:bg-olive-200 cursor-pointer"
          />
          {errors.resume && (
            <p className="text-red-600 text-xs mt-1">
              {String(errors.resume.message ?? "")}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "שולח..." : "הגש מועמדות"}
        </Button>

        <p className="text-xs text-ink-500 text-center">
          צוות שלנו יצור איתך קשר בהקדם
        </p>
      </form>
    </Card>
  );
}
