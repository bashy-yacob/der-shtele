// פרוקסי דק: סימון שתזכורת ה-opt-in הוצגה → backend. same-origin → לא נחסם.
// מעביר את כותרת ה-Authorization (Bearer token) כפי שהיא.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(`${BACKEND}/api/auth/me/optin-prompted`, {
      method: "POST",
      headers: { Authorization: auth },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה" },
      { status: 502 },
    );
  }
}
