import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'שם חייב להיות לפחות 2 תווים'),
  phone: z.string().regex(/^05[0-9]{8}$/, 'מספר טלפון לא תקין'),
  inquiry_type: z.enum(['candidate', 'employer', 'general']),
  message: z.string().min(10, 'ההודעה חייבת להיות לפחות 10 תווים'),
});

type ContactData = z.infer<typeof contactSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // TODO: שלב ב — שמירה ב-DB (Prisma + PostgreSQL)
    // TODO: שלב ב — שליחת מייל לצוות (Nodemailer / Resend)
    // כרגע: רק לוג לשרת לצורכי פיתוח
    console.log('[NEW CONTACT INQUIRY]', {
      name: data.name,
      phone: data.phone,
      type: data.inquiry_type,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACT ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'שגיאת שרת' },
      { status: 500 }
    );
  }
}
