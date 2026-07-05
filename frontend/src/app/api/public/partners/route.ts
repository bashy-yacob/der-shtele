// פרוקסי ציבורי לשותפים — נקרא בצד-לקוח מ-PartnersStrip. same-origin → לא נחסם
// ע"י NetFree. ללא auth (תוכן ציבורי). מטמון 60ש' כמו שאר התוכן הציבורי.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${BACKEND}/api/partners/public`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => ({
      success: false,
      error: "תשובה לא תקינה מהשרת",
    }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בתקשורת עם השרת" },
      { status: 502 },
    );
  }
}
