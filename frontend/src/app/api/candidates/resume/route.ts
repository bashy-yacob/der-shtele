// פרוקסי דק: מעביר העלאת קו"ח (multipart) ל-backend (NestJS) → מחזיר { path }.
import { NextResponse } from "next/server";

// מוריד סלאש מיותר בסוף הכתובת כדי שלא ייווצר `//api/...`
const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    // מעבירים את ה-FormData כמו שהוא (כולל הקובץ) ל-backend.
    const formData = await req.formData();
    const res = await fetch(`${BACKEND}/api/candidates/resume`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בהעלאת קורות החיים" },
      { status: 502 },
    );
  }
}
