"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SITE_CONTENT, CONTACT_INFO } from "@/lib/constants";
import { phoneSchema } from "@/lib/validations";
import {
  Button,
  Input,
  Select,
  Textarea,
  SectionHeading,
  Reveal,
} from "@/components/ui";
import {
  Phone,
  EnvelopeSimple,
  Clock,
  ShieldCheck,
  Handshake,
} from "@/lib/icons";

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  phone: phoneSchema,
  inquiry_type: z.enum(["candidate", "employer", "general"]),
  message: z.string().min(10, "ההודעה חייבת להיות לפחות 10 תווים"),
  // קורות חיים — אופציונלי לחלוטין. שדה ריק (FileList באורך 0) עובר;
  // אם נבחר קובץ, בודקים גודל וסוג בלבד.
  resume: z
    .any()
    .refine(
      (file) => !file || file.length === 0 || file[0]?.size <= 5 * 1024 * 1024,
      "קובץ גדול מדי (עד 5MB)",
    )
    .refine(
      (file) =>
        !file ||
        file.length === 0 ||
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file[0]?.type),
      "פורמט קובץ לא נתמך (רק PDF או Word)",
    )
    .optional(),
  // הסכמה לקבלת עדכונים — אופציונלי (חוק הספאם). הפנייה נשלחת בכל מקרה.
  optInMarketing: z.boolean().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// פרטי קשר מוצגים ככרטיסים עם אייקון Phosphor — עקבי עם שאר האתר
const CONTACT_CHANNELS = [
  {
    key: "phone",
    label: "טלפון",
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phone}`,
    note: null as string | null,
    icon: Phone,
  },
  {
    key: "email",
    label: "מייל",
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
    note: null as string | null,
    icon: EnvelopeSimple,
  },
  {
    key: "hours",
    label: "שעות פעילות",
    value: CONTACT_INFO.hours,
    href: null as string | null,
    note: CONTACT_INFO.note,
    icon: Clock,
  },
];

// תגיות אמון קטנות בהירו — עקבי עם עמוד הבית
const HERO_PILLS = [
  { label: "דיסקרטיות מלאה", icon: ShieldCheck },
  { label: "מענה אישי מהצוות", icon: Handshake },
  { label: "א׳–ה׳ · לא בשבת ויו״ט", icon: Clock },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("inquiry_type", data.inquiry_type);
      formData.append("message", data.message);
      if (data.resume && data.resume.length > 0) {
        formData.append("resume", data.resume[0]);
      }
      formData.append("optInMarketing", data.optInMarketing ? "true" : "false");

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "שגיאה בשליחה");
      }

      setSubmitted(true);
      setError(null); // Clear any previous errors
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה. נא לנסות שוב.");
    }
  };

  return (
    <main dir="rtl">
      {/* ======== HERO ======== */}
      <section className="bg-sand-100 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 py-20 sm:py-24 text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 animate-fade-up">
            {SITE_CONTENT.contact.title}
          </h1>
          <p
            className="text-ink-700 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {SITE_CONTENT.contact.subtitle}
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
                  className="inline-flex items-center gap-1.5 bg-white/70 border border-sand-200 text-ink-700 text-sm font-semibold px-3 py-1.5 rounded-full"
                >
                  <Icon className="w-[1.05rem] h-[1.05rem] text-olive-600 shrink-0" />
                  {pill.label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ======== גוף העמוד ======== */}
      <section className="bg-sand-50 py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10 lg:gap-12">
          {/* ---- פרטי קשר + הבטחת דיסקרטיות ---- */}
          <div className="lg:col-span-2">
            <Reveal>
              <SectionHeading title="פרטי קשר" align="start" className="mb-8" />
            </Reveal>

            <div className="space-y-5">
              {CONTACT_CHANNELS.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <Reveal key={channel.key} delay={idx * 90}>
                    <div className="flex gap-4 bg-white border border-sand-200 rounded-2xl shadow-soft p-5 transition-shadow hover:shadow-lift">
                      <span
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-olive-100 text-olive-700 shrink-0"
                        aria-hidden="true"
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-ink-900 font-bold mb-1">
                          {channel.label}
                        </h3>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="text-lg font-medium text-navy-600 hover:text-navy-700 break-words"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <p className="text-ink-700 font-medium leading-relaxed">
                            {channel.value}
                          </p>
                        )}
                        {channel.note && (
                          <p className="text-sm text-ink-500 mt-1.5">
                            {channel.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* הבטחת דיסקרטיות — מודל התיווך של הסוכנות */}
            <Reveal delay={270}>
              <div className="mt-6 bg-navy-600 text-white rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-olive-300 shrink-0"
                    aria-hidden="true"
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    כל פנייה נשארת אצלנו
                  </h3>
                </div>
                <p className="text-sand-200 text-sm leading-relaxed">
                  הפרטים שלך מגיעים אל הצוות בלבד ומטופלים בדיסקרטיות מלאה.
                  אנחנו לא מעבירים פרטי קשר למעסיק — כל קשר עובר דרכנו, ורק כשזה
                  באמת מתאים.
                </p>
              </div>
            </Reveal>
          </div>

          {/* ---- טופס פנייה ---- */}
          <div className="lg:col-span-3">
            <Reveal delay={90}>
              <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-6 sm:p-8">
                <SectionHeading
                  eyebrow="נשמח לשמוע"
                  title="שליחת הודעה"
                  align="start"
                  className="mb-7"
                />

                {submitted && (
                  <div className="bg-olive-50 border border-olive-300 rounded-xl p-3 mb-6">
                    <p className="text-olive-700 font-medium">
                      {SITE_CONTENT.messages.success.contact}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    {...register("name")}
                    type="text"
                    id="name"
                    label="שם מלא *"
                    placeholder="שמך"
                    error={errors.name?.message}
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
                    {...register("inquiry_type")}
                    id="inquiry_type"
                    label="סוג פנייה *"
                    error={errors.inquiry_type ? "בחרו סוג פנייה" : undefined}
                  >
                    <option value="">בחרו...</option>
                    <option value="candidate">מועמד מחפש עבודה</option>
                    <option value="employer">מעסיק מחפש כוח אדם</option>
                    <option value="general">שאלה כללית</option>
                  </Select>

                  <Textarea
                    {...register("message")}
                    id="message"
                    rows={5}
                    label="הודעה *"
                    placeholder="כתבו את הודעתכם כאן..."
                    error={errors.message?.message}
                  />

                  {/* העלאת קורות חיים */}
                  <div>
                    <label
                      htmlFor="resume"
                      className="block text-sm font-semibold text-ink-700 mb-1.5"
                    >
                      קורות חיים (אופציונלי)
                    </label>
                    <input
                      {...register("resume")}
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      className="w-full text-sm text-ink-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 file:cursor-pointer"
                    />
                    <p className="text-xs text-ink-400 mt-1.5">
                      PDF או Word, עד 5MB
                    </p>
                    {errors.resume && (
                      <p className="text-red-600 text-xs mt-1">
                        {String(errors.resume.message ?? "")}
                      </p>
                    )}
                  </div>

                  {/* הסכמת דיוור — אופציונלי (חוק הספאם) */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-sm text-ink-700">
                    <input
                      {...register("optInMarketing")}
                      type="checkbox"
                      className="mt-0.5 accent-navy-600"
                    />
                    <span className="leading-relaxed">
                      אני מאשר לקבל עדכונים על משרות ותוכן רלוונטי במייל. ניתן
                      לבטל בכל עת.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "שולח..." : "שליחת פנייה ←"}
                  </Button>

                  <p className="text-xs text-ink-400 text-center leading-relaxed">
                    בשליחת הפנייה הפרטים נשמרים אצל הצוות בלבד. אין מענה בשבת
                    וביום טוב.
                  </p>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
