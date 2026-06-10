import { NextResponse } from 'next/server';
import { candidateFormSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = candidateFormSchema.safeParse(body);

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
    console.log('[NEW CANDIDATE]', {
      name:   data.fullName,
      phone:  data.phone,
      email:  data.email,
      field:  data.field,
      region: data.region,
      jobId:  data.jobId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'שגיאת שרת' },
      { status: 500 }
    );
  }
}
