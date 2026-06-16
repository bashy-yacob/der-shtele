"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FIELD_LABELS, REGION_LABELS, SITE_CONTENT } from "@/lib/constants";
import { phoneSchema } from "@/lib/validations";

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
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      // שלב 1: העלאת קו"ח דרך ה-proxy → קבלת path לאחסון
      const fileList = data.resume as FileList;
      const fd = new FormData();
      fd.append("resume", fileList[0]);
      const upRes = await fetch("/api/candidates/resume", {
        method: "POST",
        body: fd,
      });
      if (!upRes.ok) throw new Error("שגיאה בהעלאת קורות החיים");
      const upJson = await upRes.json();
      const cvPath = upJson?.data?.path ?? upJson?.path;

      // שלב 2: שליחת ההגשה עם הנתיב (בלי ה-FileList — ה-API דוחה שדות לא מוכרים)
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold mb-6">הגשת מועמדות</h2>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-medium text-sm">
            {SITE_CONTENT.messages.success.candidate}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            שם מלא *
          </label>
          <input
            {...register("fullName")}
            type="text"
            id="fullName"
            placeholder="שמך"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          {errors.fullName && (
            <p className="text-red-600 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            טלפון *
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            placeholder="050-0000000"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            דואר אלקטרוני *
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            placeholder="example@mail.com"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Field */}
        <div>
          <label
            htmlFor="field"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            תחום מבוקש *
          </label>
          <select
            {...register("field")}
            id="field"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
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

        {/* Region */}
        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            אזור מועדף *
          </label>
          <select
            {...register("region")}
            id="region"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="">בחרו...</option>
            {Object.entries(REGION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="text-red-600 text-xs mt-1">{errors.region.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            הערות (אופציונלי)
          </label>
          <textarea
            {...register("notes")}
            id="notes"
            rows={3}
            placeholder="כל מידע נוסף שרלוונטי..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            קורות חיים (PDF או Word) *
          </label>
          <input
            {...register("resume")}
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {errors.resume && (
            <p className="text-red-600 text-xs mt-1">
              {String(errors.resume.message ?? "")}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? "שולח..." : "הגש מועמדות"}
        </button>

        <p className="text-xs text-neutral-500 text-center">
          צוות שלנו יצור איתך קשר בהקדם
        </p>
      </form>
    </div>
  );
}
