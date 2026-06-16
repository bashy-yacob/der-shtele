import { z } from 'zod';

/**
 * טלפון נייד ישראלי — מקור אמת יחיד לכל הטפסים.
 * מנרמל קלט (מסיר מקפים/רווחים שהמשתמש מקליד, כולל לפי ה-placeholder עם מקפים)
 * ואז מאמת `05X` + 7 ספרות. הערך שעובר הלאה הוא 10 ספרות נקיות.
 */
export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'));

export const candidateFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'נא להזין שם מלא')
    .max(100),

  phone: phoneSchema,

  email: z
    .string()
    .email('כתובת אימייל לא תקינה'),

  field: z.enum(
    ['logistics', 'admin', 'sales', 'education', 'tech', 'finance', 'healthcare', 'other'],
    { required_error: 'נא לבחור תחום' }
  ),

  region: z.enum(
    ['bnei_brak', 'jerusalem', 'elad', 'modiin_ilit', 'beitar_ilit', 'other'],
    { required_error: 'נא לבחור אזור' }
  ),

  jobId: z.string().optional(),

  notes: z.string().max(1000).optional(),
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;
