// פרוקסי דק: רשימת ערים/אזורים קיימים ל-backend. same-origin → לא נחסם ע"י NetFree.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/jobs/regions`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בטעינת רשימת הערים" },
      { status: 502 },
    );
  }
}
