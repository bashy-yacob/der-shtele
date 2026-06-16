"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SITE_CONTENT, CONTACT_INFO } from "@/lib/constants";
import { phoneSchema } from "@/lib/validations";
import { Button, Card, Input, SectionHeading } from "@/components/ui";

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  phone: phoneSchema,
  inquiry_type: z.enum(["candidate", "employer", "general"]),
  message: z.string().min(10, "ההודעה חייבת להיות לפחות 10 תווים"),
  resume: z
    .any()
    .refine((file) => !file || file.length > 0, "יש לבחור קובץ קורות חיים")
    .refine(
      (file) => !file || file[0]?.size <= 5 * 1024 * 1024,
      "קובץ גדול מדי (עד 5MB)",
    )
    .refine(
      (file) =>
        !file ||
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file[0]?.type),
      "פורמט קובץ לא נתמך (רק PDF או Word)",
    )
    .optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

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
      {/* Hero Section */}
      <section className="bg-sand-100 py-16 px-4 border-b border-sand-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold mb-4">
            {SITE_CONTENT.contact.title}
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 leading-relaxed">
            {SITE_CONTENT.contact.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <section>
            <SectionHeading title="פרטי קשר" align="start" className="mb-8" />

            <div className="space-y-6 mb-8">
              <Card className="border-r-4 border-r-olive-500">
                <h3 className="font-display text-ink-900 font-bold mb-2">
                  טלפון
                </h3>
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-lg font-medium text-navy-600 hover:text-navy-700"
                >
                  {CONTACT_INFO.phone}
                </a>
              </Card>

              <Card className="border-r-4 border-r-olive-500">
                <h3 className="font-display text-ink-900 font-bold mb-2">
                  מייל
                </h3>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-lg font-medium text-navy-600 hover:text-navy-700"
                >
                  {CONTACT_INFO.email}
                </a>
              </Card>

              <Card className="border-r-4 border-r-olive-500">
                <h3 className="font-display text-ink-900 font-bold mb-2">
                  שעות פעילות
                </h3>
                <p className="text-ink-700 font-medium">{CONTACT_INFO.hours}</p>
                <p className="text-sm text-ink-500 mt-2">{CONTACT_INFO.note}</p>
              </Card>
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <SectionHeading
              title="שלחו לנו הודעה"
              align="start"
              className="mb-8"
            />

            {submitted && (
              <div className="bg-olive-50 border border-olive-200 rounded-xl p-4 mb-6">
                <p className="text-olive-700 font-medium">
                  {SITE_CONTENT.messages.success.contact}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <Input
                {...register("name")}
                type="text"
                id="name"
                label="שם מלא *"
                placeholder="שמך"
                error={errors.name?.message}
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

              {/* Inquiry Type */}
              <div>
                <label
                  htmlFor="inquiry_type"
                  className="block text-sm font-semibold text-ink-700 mb-1.5"
                >
                  סוג פנייה *
                </label>
                <select
                  {...register("inquiry_type")}
                  id="inquiry_type"
                  className="w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
                >
                  <option value="">בחרו...</option>
                  <option value="candidate">מועמד מחפש עבודה</option>
                  <option value="employer">מעסיק מחפש כוח אדם</option>
                  <option value="general">שאלה כללית</option>
                </select>
                {errors.inquiry_type && (
                  <p className="text-red-600 text-xs mt-1">בחרו סוג פנייה</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-ink-700 mb-1.5"
                >
                  הודעה *
                </label>
                <textarea
                  {...register("message")}
                  id="message"
                  rows={5}
                  placeholder="כתבו את הודעתכם כאן..."
                  className="w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all"
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Resume Upload */}
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
                  className="w-full text-sm text-ink-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                />
                {errors.resume && (
                  <p className="text-red-600 text-xs mt-1">
                    {String(errors.resume.message ?? "")}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "שולח..." : "שלח פניה"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
