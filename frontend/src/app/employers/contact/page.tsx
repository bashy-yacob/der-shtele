"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SITE_CONTENT, FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { SCOPE_OPTIONS, EXPERIENCE_OPTIONS } from "@/lib/labels";
import { phoneSchema } from "@/lib/validations";
import {
  Button,
  Input,
  Select,
  Textarea,
  CityCombobox,
  SectionHeading,
  Reveal,
} from "@/components/ui";
import { HandCoins, ShieldCheck, Lock } from "@/lib/icons";

const FORM = SITE_CONTENT.employers.contactForm;

// תגיות אמון קטנות בהירו — ערכי הליבה למעסיק
const HERO_PILLS = [
  { label: "תשלום רק על תוצאה", icon: HandCoins },
  { label: "ערבות שלושה חודשים", icon: ShieldCheck },
  { label: "דיסקרטיות מלאה", icon: Lock },
];

// ולידציה לטופס פניית מעסיק — נשלח דרך ה-endpoint הציבורי /api/contact.
// המטרה: לאסוף מהמעסיק את כל מה שהצוות צריך כדי לפתוח משרה ולחזור אליו,
// כך שהמנהל בדשבורד לא יצטרך לרדוף אחרי פרטים חסרים (איפיון 6.1 + 7.3).
const employerSchema = z.object({
  // —— פרטי החברה ואיש הקשר (פנימי בלבד) ——
  companyName: z.string().min(2, "שם החברה חייב להיות לפחות 2 תווים"),
  businessNumber: z.string().optional(),
  companyLocation: z.string().optional(),
  contactName: z.string().min(2, "שם איש הקשר חייב להיות לפחות 2 תווים"),
  phone: phoneSchema,
  email: z.string().email("כתובת אימייל לא תקינה"),

  // —— פרטי המשרה ——
  jobTitle: z.string().min(2, "שם התפקיד חייב להיות לפחות 2 תווים"),
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
  experience: z.enum(EXPERIENCE_OPTIONS, {
    required_error: "נא לבחור ניסיון נדרש",
  }),
  salary: z.string().optional(),
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
      // שולחים כל פרט כשדה מובְנה בנפרד — כך הצוות מקבל בדשבורד פנייה מלאה
      // ומובְנת (ולא טקסט שצריך לפענח), בלי לרדוף אחרי מידע חסר.
      // message = תיאור המשרה (השדה החובה ב-endpoint).
      const formData = new FormData();
      formData.append("name", data.contactName);
      formData.append("phone", data.phone);
      formData.append("inquiry_type", "employer");
      formData.append("message", data.description);

      // פרטי החברה ואיש הקשר
      formData.append("companyName", data.companyName);
      formData.append("email", data.email);
      if (data.businessNumber)
        formData.append("businessNumber", data.businessNumber);
      if (data.companyLocation)
        formData.append("companyLocation", data.companyLocation);

      // פרטי המשרה
      formData.append("jobTitle", data.jobTitle);
      formData.append("field", data.field);
      formData.append("region", data.region);
      formData.append("scope", data.scope);
      formData.append("experience", data.experience);
      if (data.salary) formData.append("salary", data.salary);

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
      <section className="relative overflow-hidden border-b border-navy-700">
        {/* תמונת רקע — לחיצת יד (עקבי עם ה-Hero בעמוד הבית) */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/hero-handshake.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* שכבת-על סגולה — לקריאוּת הטקסט הלבן */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-800/85 via-navy-700/60 to-navy-600/35" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 sm:py-24 text-center">
          <h1 className="font-display text-white text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 animate-fade-up [text-shadow:0_2px_24px_rgba(21,15,36,0.45)]">
            {FORM.title}
          </h1>
          <p
            className="text-sand-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {FORM.subtitle}
          </p>

          {/* תגיות אמון קטנות */}
          <ul
            className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {HERO_PILLS.map((pill) => {
              const Icon = pill.icon;
              return (
                <li
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 text-white text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  <Icon className="w-[1.05rem] h-[1.05rem] text-olive-300 shrink-0" />
                  {pill.label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ======== גוף העמוד ======== */}
      <section className="bg-sand-50 py-16 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* הבטחת דיסקרטיות — מודל התיווך של הסוכנות */}
          <Reveal>
            <div className="mb-8 bg-navy-600 text-white rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-olive-300 shrink-0"
                  aria-hidden="true"
                >
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="font-display text-lg font-bold text-white">
                  {SITE_CONTENT.employers.terms.discretion.title}
                </h2>
              </div>
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
                title="פרטי הפנייה"
                align="start"
                className="mb-7"
              />

              <p className="text-ink-500 text-sm leading-relaxed mb-6 -mt-3">
                כדי שנוכל לטפל במשרה ולחזור אליכם מהר, מלאו את כל הפרטים. ככל
                שהתמונה מלאה יותר — כך נחסוך פניות חוזרות. הכל נשמר אצל הצוות
                בלבד.
              </p>

              {submitted && (
                <div className="bg-olive-50 border border-olive-300 rounded-xl p-3 mb-6">
                  <p className="text-olive-700 font-medium">{FORM.success}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* ——— פרטי החברה ואיש הקשר (פנימי בלבד) ——— */}
                <h3 className="font-display text-ink-900 text-base font-bold border-b border-sand-200 pb-2">
                  פרטי החברה ואיש הקשר
                </h3>

                <Input
                  {...register("companyName")}
                  type="text"
                  id="companyName"
                  label="שם החברה *"
                  placeholder="שם החברה או הארגון"
                  error={errors.companyName?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    {...register("businessNumber")}
                    type="text"
                    id="businessNumber"
                    label="ח.פ / מספר עוסק"
                    placeholder="לא חובה"
                    error={errors.businessNumber?.message}
                  />

                  <Input
                    {...register("companyLocation")}
                    type="text"
                    id="companyLocation"
                    label="מיקום החברה"
                    placeholder="עיר / כתובת (לא חובה)"
                    error={errors.companyLocation?.message}
                  />
                </div>

                <Input
                  {...register("contactName")}
                  type="text"
                  id="contactName"
                  label="איש קשר *"
                  placeholder="שם איש הקשר"
                  error={errors.contactName?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    {...register("phone")}
                    type="tel"
                    id="phone"
                    label="טלפון *"
                    placeholder="050-0000000"
                    error={errors.phone?.message}
                  />

                  <Input
                    {...register("email")}
                    type="email"
                    id="email"
                    label="מייל *"
                    placeholder="name@company.co.il"
                    error={errors.email?.message}
                  />
                </div>

                {/* ——— פרטי המשרה ——— */}
                <h3 className="font-display text-ink-900 text-base font-bold border-b border-sand-200 pb-2 pt-2">
                  פרטי המשרה
                </h3>

                <Input
                  {...register("jobTitle")}
                  type="text"
                  id="jobTitle"
                  label="שם התפקיד *"
                  placeholder="לדוגמה: מנהל/ת חשבונות, נציג/ת מכירות"
                  error={errors.jobTitle?.message}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                  <Select
                    {...register("experience")}
                    id="experience"
                    label="ניסיון נדרש *"
                    error={errors.experience ? "בחרו ניסיון נדרש" : undefined}
                  >
                    <option value="">בחרו...</option>
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  {...register("salary")}
                  type="text"
                  id="salary"
                  label="טווח שכר מוצע"
                  placeholder="נשמר אצל הצוות בלבד — לא יופיע באתר (לא חובה)"
                  error={errors.salary?.message}
                />

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
