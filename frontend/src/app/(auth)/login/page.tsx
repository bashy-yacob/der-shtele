"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      // יעד חזרה מ-?redirect (רק נתיב יחסי בטוח — מונע open redirect)
      const raw = new URLSearchParams(window.location.search).get("redirect");
      const target =
        raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
      router.push(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-[70vh] items-center justify-center px-4 py-16"
      dir="rtl"
    >
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">
          התחברות
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <Input
            id="email"
            type="email"
            label="דואר אלקטרוני"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "מתחבר..." : "התחברות"}
          </Button>
        </form>
        <p className="text-sm text-ink-700 text-center mt-6">
          אין חשבון?{" "}
          <Link
            href="/register"
            className="text-navy-600 font-semibold hover:underline"
          >
            הרשמה
          </Link>
        </p>
      </Card>
    </main>
  );
}
