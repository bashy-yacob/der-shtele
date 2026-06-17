// פרוקסי דק: משרות שמורות → backend (NestJS). same-origin → לא נחסם ע"י NetFree.
// מעביר את כותרת ה-Authorization (Bearer token) כפי שהיא.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(`${BACKEND}/api/saved-jobs`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בטעינת המשרות השמורות" },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const body = await req.text();
    const res = await fetch(`${BACKEND}/api/saved-jobs`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בשמירת המשרה" },
      { status: 502 },
    );
  }
}
