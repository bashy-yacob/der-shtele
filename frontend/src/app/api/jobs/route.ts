// פרוקסי דק: מעביר את בקשת לוח המשרות ל-backend (NestJS).
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL ?? 'http://localhost:4000';

export async function GET(req: Request) {
  const { search } = new URL(req.url);
  try {
    const res = await fetch(`${BACKEND}/api/jobs${search}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת המשרות' },
      { status: 502 },
    );
  }
}
