// פרוקסי דק: שליחה חוזרת של מייל אימות → backend. מעביר Authorization.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(`${BACKEND}/api/auth/me/resend-verification`, {
      method: "POST",
      headers: { Authorization: auth },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בשליחת מייל האימות" },
      { status: 502 },
    );
  }
}
