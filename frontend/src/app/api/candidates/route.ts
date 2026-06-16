// פרוקסי דק: מעביר הגשת מועמדות (JSON) ל-backend (NestJS).
import { NextResponse } from "next/server";

// מוריד סלאש מיותר בסוף הכתובת כדי שלא ייווצר `//api/...`
const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND}/api/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") ?? "",
      },
      body,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאת שרת" },
      { status: 502 },
    );
  }
}
