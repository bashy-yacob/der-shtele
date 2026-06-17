// פרוקסי דק וגנרי לכל קריאות ה-CRM/דשבורד → backend (NestJS).
// same-origin → לא נחסם ע"י NetFree. מעביר את ה-Authorization (Bearer) כפי שהוא.
// ההגנה האמיתית (role=staff/admin) נאכפת ב-backend; כאן רק העברה.
import { NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

async function forward(
  req: Request,
  pathParts: string[],
  method: string,
): Promise<NextResponse> {
  const path = pathParts.map(encodeURIComponent).join("/");
  const search = new URL(req.url).search; // משמר query params (סינון וכו')
  const auth = req.headers.get("authorization") ?? "";

  const init: RequestInit = {
    method,
    headers: { Authorization: auth },
    cache: "no-store",
  };

  if (method !== "GET" && method !== "DELETE") {
    const body = await req.text();
    if (body) {
      init.body = body;
      init.headers = { ...init.headers, "Content-Type": "application/json" };
    }
  }

  try {
    const res = await fetch(`${BACKEND}/api/${path}${search}`, init);
    const json = await res.json().catch(() => ({
      success: false,
      error: "תשובה לא תקינה מהשרת",
    }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאה בתקשורת עם השרת" },
      { status: 502 },
    );
  }
}

type Ctx = { params: { path: string[] } };

export async function GET(req: Request, { params }: Ctx) {
  return forward(req, params.path, "GET");
}
export async function POST(req: Request, { params }: Ctx) {
  return forward(req, params.path, "POST");
}
export async function PATCH(req: Request, { params }: Ctx) {
  return forward(req, params.path, "PATCH");
}
export async function DELETE(req: Request, { params }: Ctx) {
  return forward(req, params.path, "DELETE");
}
