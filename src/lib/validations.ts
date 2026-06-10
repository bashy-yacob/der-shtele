import { z } from 'zod';

export const candidateFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'נא להזין שם מלא')
    .max(100),

  phone: z
    .string()
    .regex(/^0[5-9]\d{8}$/, 'מספר טלפון לא תקין'),

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
