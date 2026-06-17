// פרוקסי דק: ההגשות של המשתמש המחובר → backend (NestJS).
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(`${BACKEND}/api/candidates/me/applications`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בטעינת ההגשות" },
      { status: 502 },
    );
  }
}
