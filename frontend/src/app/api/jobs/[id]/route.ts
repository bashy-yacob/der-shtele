// פרוקסי דק: מעביר בקשת משרה בודדת ל-backend (NestJS).
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL ?? 'http://localhost:4000';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const res = await fetch(`${BACKEND}/api/jobs/${params.id}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת המשרה' },
      { status: 502 },
    );
  }
}
