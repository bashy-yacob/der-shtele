'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SITE_CONTENT, CONTACT_INFO } from '@/lib/constants';

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, 'שם חייב להיות לפחות 2 תווים'),
  phone: z.string().regex(/^05[0-9]{8}$/, 'מספר טלפון לא תקין'),
  inquiry_type: z.enum(['candidate', 'employer', 'general']),
  message: z.string().min(10, 'ההודעה חייבת להיות לפחות 10 תווים'),
  resume: z.any()
    .refine((file) => !file || file.length > 0, 'יש לבחור קובץ קורות חיים')
    .refine((file) => !file || file[0]?.size <= 5 * 1024 * 1024, 'קובץ גדול מדי (עד 5MB)')
    .refine(
      (file) => !file || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file[0]?.type),
      'פורמט קובץ לא נתמך (רק PDF או Word)'
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
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('inquiry_type', data.inquiry_type);
      formData.append('message', data.message);
      if (data.resume && data.resume.length > 0) {
        formData.append('resume', data.resume[0]);
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה בשליחה');
      }

      setSubmitted(true);
      setError(null); // Clear any previous errors
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה. נא לנסות שוב.');
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-primary-50 py-12 px-4 border-b border-primary-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">{SITE_CONTENT.contact.title}</h1>
          <p className="text-xl text-neutral-600">{SITE_CONTENT.contact.subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <section>
            <h2 className="text-2xl font-bold mb-8">פרטי קשר</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-primary-600">
                <h3 className="font-bold text-primary-600 mb-2">טלפון</h3>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-lg font-medium text-neutral-700">
                  {CONTACT_INFO.phone}
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-primary-600">
                <h3 className="font-bold text-primary-600 mb-2">מייל</h3>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-lg font-medium text-neutral-700">
                  {CONTACT_INFO.email}
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-primary-600">
                <h3 className="font-bold text-primary-600 mb-2">שעות פעילות</h3>
                <p className="text-neutral-700 font-medium">{CONTACT_INFO.hours}</p>
                <p className="text-sm text-neutral-600 mt-2">{CONTACT_INFO.note}</p>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-2xl font-bold mb-8">שלחו לנו הודעה</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-medium">{SITE_CONTENT.messages.success.contact}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  שם מלא *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="שמך"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  טלפון *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="050-0000000"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              {/* Inquiry Type */}
              <div>
                <label htmlFor="inquiry_type" className="block text-sm font-medium text-neutral-700 mb-2">
                  סוג פנייה *
                </label>
                <select
                  {...register('inquiry_type')}
                  id="inquiry_type"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="">בחרו...</option>
                  <option value="candidate">מועמד מחפש עבודה</option>
                  <option value="employer">מעסיק מחפש כוח אדם</option>
                  <option value="general">שאלה כללית</option>
                </select>
                {errors.inquiry_type && <p className="text-red-600 text-sm mt-1">בחרו סוג פנייה</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  הודעה *
                </label>
                <textarea
                  {...register('message')}
                  id="message"
                  rows={5}
                  placeholder="כתבו את הודעתכם כאן..."
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}
              </div>

              {/* Resume Upload */}
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-neutral-700 mb-2">
                  קורות חיים (אופציונלי)
                </label>
                <input
                  {...register('resume')}
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {errors.resume && (
                  <p className="text-red-600 text-sm mt-1">
                    {String(errors.resume.message ?? '')}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'שולח...' : 'שלח פניה'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}