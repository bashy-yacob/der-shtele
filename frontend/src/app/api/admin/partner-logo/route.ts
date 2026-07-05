// פרוקסי ייעודי להעלאת לוגו שותף (multipart). הפרוקסי הגנרי [...path] מעביר JSON
// בלבד (req.text()), לכן כאן מעבירים את ה-FormData כפי שהוא. same-origin → לא נחסם
// ע"י NetFree. ההגנה (role=staff/admin) נאכפת ב-backend; כאן רק העברה.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization") ?? "";
  try {
    const form = await req.formData();
    const res = await fetch(`${BACKEND}/api/partners/logo`, {
      method: "POST",
      headers: { Authorization: auth },
      body: form, // fetch מקודד מחדש כ-multipart עם boundary חדש
      cache: "no-store",
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
