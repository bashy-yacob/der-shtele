// פרוקסי דק: שינוי סיסמה → backend (NestJS). same-origin → לא נחסם ע"י NetFree.
// מעביר את כותרת ה-Authorization (Bearer token) כפי שהיא.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const body = await req.text();
    const res = await fetch(`${BACKEND}/api/auth/me/password`, {
      method: "PATCH",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בעדכון הסיסמה" },
      { status: 502 },
    );
  }
}
