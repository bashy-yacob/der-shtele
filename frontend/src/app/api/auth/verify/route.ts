// פרוקסי דק: אימות כתובת מייל → backend (NestJS). public — לא דורש token.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה באימות הכתובת" },
      { status: 502 },
    );
  }
}
