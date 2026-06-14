// פרוקסי דק: מעביר טופס "צור קשר" (multipart, כולל קו"ח) ל-backend (NestJS).
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL ?? 'http://localhost:4000';

export async function POST(req: Request) {
  try {
    // מעבירים את ה-FormData כמו שהוא (כולל הקובץ) ל-backend.
    const formData = await req.formData();
    const res = await fetch(`${BACKEND}/api/contact`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: 'שגיאת שרת' },
      { status: 502 },
    );
  }
}
