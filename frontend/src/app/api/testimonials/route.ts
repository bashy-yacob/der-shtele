// פרוקסי דק: מעביר את בקשת ההמלצות הציבוריות ל-backend (NestJS).
import { NextResponse } from "next/server";

// מוריד סלאש מיותר בסוף הכתובת כדי שלא ייווצר `//api/...`
const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/testimonials`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בטעינת ההמלצות" },
      { status: 502 },
    );
  }
}
