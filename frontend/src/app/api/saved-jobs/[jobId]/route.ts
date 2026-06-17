// פרוקסי דק: הסרת משרה מהשמורות → backend.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function DELETE(
  req: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const res = await fetch(
      `${BACKEND}/api/saved-jobs/${encodeURIComponent(params.jobId)}`,
      {
        method: "DELETE",
        headers: { Authorization: auth },
        cache: "no-store",
      },
    );
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בהסרת המשרה" },
      { status: 502 },
    );
  }
}
