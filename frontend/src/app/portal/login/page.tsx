"use client";

// כניסת מעסיק לפורטל. נפרד מכניסת המועמדים; הרשמת מעסיק חדש ב-/portal/register.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { safeRedirect } from "@/lib/redirect";
import { Button, Card, Input } from "@/components/ui";

export default function PortalLoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // כבר מחובר כמעסיק → ישר לפורטל (או ליעד שביקש ב-?redirect).
  useEffect(() => {
    if (loading || user?.role !== "employer") return;
    const raw = new URLSearchParams(window.location.search).get("redirect");
    router.replace(safeRedirect(raw, "/portal"));
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      const raw = new URLSearchParams(window.location.search).get("redirect");
      router.replace(safeRedirect(raw, "/portal"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחברות");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="py-16 px-4" dir="rtl">
      <Card className="max-w-md mx-auto p-8">
        <h1 className="font-display text-2xl text-ink-900 mb-1 text-center">
          פורטל מעסיקים
        </h1>
        <p className="text-sm text-ink-500 mb-6 text-center">
          כניסה עם פרטי הגישה שהופקו עבורכם על ידי הצוות.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            id="email"
            label="דואר אלקטרוני"
            placeholder="company@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            id="password"
            label="סיסמה"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "מתחבר..." : "כניסה"}
          </Button>
        </form>

        <p className="text-sm text-ink-500 mt-6 text-center">
          אין לכם חשבון?{" "}
          <Link
            href="/portal/register"
            className="font-semibold text-navy-600 hover:underline"
          >
            להרשמת מעסיק ←
          </Link>
        </p>
      </Card>
    </main>
  );
}
