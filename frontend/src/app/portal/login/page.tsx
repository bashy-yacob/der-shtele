"use client";

// כניסת מעסיק לפורטל — פרטי הכניסה מופקים ע"י הצוות. נפרד מכניסת המועמדים.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button, Card, Input } from "@/components/ui";

export default function PortalLoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // כבר מחובר כמעסיק → ישר לפורטל.
  useEffect(() => {
    if (!loading && user?.role === "employer") router.replace("/portal");
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/portal");
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

        <p className="text-xs text-ink-400 mt-6 text-center leading-relaxed">
          אין לכם פרטי גישה? פנו לצוות דער שטעלע ונפיק עבורכם חשבון.
        </p>
      </Card>
    </main>
  );
}
