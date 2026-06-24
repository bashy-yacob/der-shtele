// פרוקסי דק: קו"ח של המשתמש המחובר → backend. GET למצב, POST (multipart) להחלפה.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(`${BACKEND}/api/candidates/me/cv`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בטעינת קורות החיים" },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${BACKEND}/api/candidates/me/cv`, {
      method: "POST",
      headers: { Authorization: req.headers.get("authorization") ?? "" },
      body: formData,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בהחלפת קורות החיים" },
      { status: 502 },
    );
  }
}
