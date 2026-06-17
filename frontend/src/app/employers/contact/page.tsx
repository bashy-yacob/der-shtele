"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SITE_CONTENT, FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { SCOPE_OPTIONS } from "@/lib/labels";
import { phoneSchema } from "@/lib/validations";
import {
  Button,
  Input,
  Select,
  Textarea,
  CityCombobox,
  SectionHeading,
  SkylineMotif,
  Reveal,
} from "@/components/ui";

const FORM = SITE_CONTENT.employers.contactForm;

// ולידציה לטופס פניית מעסיק — נשלח דרך ה-endpoint הציבורי /api/contact.
const employerSchema = z.object({
  companyName: z.string().min(2, "שם החברה חייב להיות לפחות 2 תווים"),
  contactName: z.string().min(2, "שם איש הקשר חייב להיות לפחות 2 תווים"),
  phone: phoneSchema,
  field: z.enum(
    [
      "logistics",
      "admin",
      "sales",
      "education",
      "tech",
      "finance",
      "healthcare",
      "other",
    ],
    { required_error: "נא לבחור תחום" },
  ),
  region: z.string().min(2, "נא להזין אזור"),
  scope: z.enum(SCOPE_OPTIONS, { required_error: "נא לבחור היקף" }),
  description: z.string().min(10, "תיאור המשרה חייב להיות לפחות 10 תווים"),
});

type EmployerFormData = z.infer<typeof employerSchema>;

export default function EmployersContactPage() {
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
  } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
  });

  const onSubmit = async (data: EmployerFormData) => {
    try {
      // ה-endpoint הציבורי מקבל name/phone/inquiry_type/message בלבד —
      // מרכזים את פרטי המשרה להודעה אחת מובנית שהצוות מקבל במייל.
      const message = [
        `חברה: ${data.companyName}`,
        `תחום: ${FIELD_LABELS[data.field]}`,
        `אזור: ${data.region}`,
        `היקף: ${data.scope}`,
        "",
        "תיאור המשרה:",
        data.description,
      ].join("\n");

      const formData = new FormData();
      formData.append("name", data.contactName);
      formData.append("phone", data.phone);
      formData.append("inquiry_type", "employer");
      formData.append("message", message);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "שגיאה בשליחה");
      }

      setSubmitted(true);
      setError(null);
      reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה. נא לנסות שוב.");
    }
  };

  return (
    <main dir="rtl">
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-sand-100 border-b border-sand-200">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 text-sand-300/70 animate-float"
          aria-hidden="true"
        >
          <SkylineMotif className="w-full h-full" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 sm:py-24 text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 animate-fade-up">
            {FORM.title}
          </h1>
          <p
            className="text-ink-700 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {FORM.subtitle}
          </p>
        </div>
      </section>

      {/* ======== גוף העמוד ======== */}
      <section className="bg-sand-50 py-16 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* הבטחת דיסקרטיות — מודל התיווך של הסוכנות */}
          <Reveal>
            <div className="mb-8 bg-navy-600 text-white rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold mb-2">
                {SITE_CONTENT.employers.terms.discretion.title}
              </h2>
              <p className="text-sand-200 text-sm leading-relaxed">
                {SITE_CONTENT.employers.terms.discretion.body}
              </p>
            </div>
          </Reveal>

          {/* טופס פניית מעסיק */}
          <Reveal delay={90}>
            <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-6 sm:p-8">
              <SectionHeading
                eyebrow="נשמח לשמוע"
                title="פרטי המשרה"
                align="start"
                className="mb-7"
              />

              {submitted && (
                <div className="bg-olive-50 border border-olive-200 rounded-xl p-4 mb-6">
                  <p className="text-olive-700 font-medium">{FORM.success}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  {...register("companyName")}
                  type="text"
                  id="companyName"
                  label="שם החברה *"
                  placeholder="שם החברה או הארגון"
                  error={errors.companyName?.message}
                />

                <Input
                  {...register("contactName")}
                  type="text"
                  id="contactName"
                  label="איש קשר *"
                  placeholder="שם איש הקשר"
                  error={errors.contactName?.message}
                />

                <Input
                  {...register("phone")}
                  type="tel"
                  id="phone"
                  label="טלפון *"
                  placeholder="050-0000000"
                  error={errors.phone?.message}
                />

                <Select
                  {...register("field")}
                  id="field"
                  label="תחום *"
                  error={errors.field ? "בחרו תחום" : undefined}
                >
                  <option value="">בחרו...</option>
                  {Object.entries(FIELD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>

                <CityCombobox
                  {...register("region")}
                  id="region"
                  label="אזור *"
                  options={cityOptions}
                  error={errors.region?.message}
                />

                <Select
                  {...register("scope")}
                  id="scope"
                  label="היקף משרה *"
                  error={errors.scope ? "בחרו היקף" : undefined}
                >
                  <option value="">בחרו...</option>
                  {SCOPE_OPTIONS.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </Select>

                <Textarea
                  {...register("description")}
                  id="description"
                  rows={5}
                  label="תיאור המשרה והדרישות *"
                  placeholder="ספרו לנו על התפקיד, הדרישות והתנאים. הפרטים נשמרים אצל הצוות בלבד."
                  error={errors.description?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "שולח..." : "שליחת המשרה ←"}
                </Button>

                <p className="text-xs text-ink-400 text-center leading-relaxed">
                  {FORM.note}
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
