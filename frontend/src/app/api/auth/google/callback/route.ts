// יעד ה-redirect מ-Google. מאמת state מול ה-cookie, מעביר את ה-code לבק
// server-to-server (Vercel→Render — לא נחסם ע"י NetFree), ומפנה לעמוד
// /auth/complete עם הטוקן ב-URL fragment (לא query — לא נשלח לשרת/logs).
import { NextRequest, NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = () => NextResponse.redirect(new URL("/login?error=google", origin));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;

  // אימות state (CSRF) — חייב להתאים ל-cookie שנשמר ב-start.
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail();
  }

  try {
    const res = await fetch(`${BACKEND}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = await res.json();
    if (!res.ok || !json?.success || !json?.data?.accessToken) {
      return fail();
    }

    const token = encodeURIComponent(json.data.accessToken);
    const redirect = NextResponse.redirect(`${origin}/auth/complete#token=${token}`);
    redirect.cookies.delete("g_oauth_state");
    return redirect;
  } catch {
    return fail();
  }
}
