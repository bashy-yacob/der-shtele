import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata: Metadata = { title: "הרשמה" };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  // שמירת יעד החזרה (?redirect) גם במעבר להתחברות — כדי לא לאבד אותו.
  const redirect = searchParams?.redirect;
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";
  return (
    <AuthShell
      title="יצירת חשבון"
      subtitle="דקה אחת, וזה אצלנו — עוקבים אחר ההגשות ושומרים משרות בקלות."
      panelTitle="אתה שולח קורות חיים. אנחנו עושים את השאר."
      panelPoints={[
        "הרשמה חינם — בלי התחייבות",
        "המעסיק לא רואה את הפרטים שלך ישירות",
        "פונים אליך רק כשיש התאמה אמיתית",
        "בלי מיילים בשבת ובחגים",
      ]}
      footer={
        <>
          כבר רשום?{" "}
          <Link
            href={loginHref}
            className="text-navy-600 font-semibold hover:underline"
          >
            התחברות
          </Link>
        </>
      }
    >
      <RegisterForm />
      <GoogleButton label="הרשמה עם Google" />
    </AuthShell>
  );
}
