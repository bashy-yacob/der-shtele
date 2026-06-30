"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { safeRedirect, defaultDestForRole } from "@/lib/redirect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // ?redirect נקרא בצד הלקוח בלבד (אין window ב-SSR) — לשימוש בקישור ההרשמה.
  const [redirect, setRedirect] = useState<string | null>(null);

  // חזרה מ-Google עם כשל (state שגוי / אימות נכשל / NetFree חוסם) + קריאת ?redirect.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect"));
    if (params.get("error") === "google") {
      setError(
        "ההתחברות עם Google נכשלה. נסה שוב או השתמש בדואר אלקטרוני וסיסמה.",
      );
    }
  }, []);

  // כבר מחובר? לא להציג את הטופס — להפנות ליעד שביקש (?redirect) או לפי תפקיד.
  // משמש גם אחרי התחברות מוצלחת (login מעדכן את user) — הניווט מתבצע כאן בלבד.
  useEffect(() => {
    if (loading || !user) return;
    const raw = new URLSearchParams(window.location.search).get("redirect");
    router.replace(safeRedirect(raw, defaultDestForRole(user.role)));
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      // הניווט מתבצע בשומר למעלה ברגע ש-user מתעדכן.
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחברות");
      setSubmitting(false);
    }
  };

  const registerHref = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <AuthShell
      title="ברוך שובך"
      subtitle="התחבר כדי לעקוב אחר ההגשות ולנהל את המשרות השמורות שלך."
      panelTitle="ממשיכים בדיוק מהמקום שעצרת."
      panelPoints={[
        "ההגשות שלך וההתקדמות במקום אחד",
        "המשרות ששמרת מחכות לך",
        "הפרטים שלך נשארים אצל הצוות בלבד",
      ]}
      footer={
        <>
          אין חשבון?{" "}
          <Link
            href={registerHref}
            className="text-navy-600 font-semibold hover:underline"
          >
            הרשמה
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
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
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "מתחבר..." : "התחברות"}
        </Button>
      </form>
      <GoogleButton label="התחברות עם Google" />
    </AuthShell>
  );
}
