"use client";

// הרשמת מעסיק עצמית (סעיף 6) — בקשת גישה לפורטל. ציבורי, לפני התחברות.
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui";
import { EmployerRegisterForm } from "@/components/forms/EmployerRegisterForm";

export default function PortalRegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // כבר מחובר כמעסיק → ישר לפורטל (אין טעם בהרשמה חוזרת).
  useEffect(() => {
    if (!loading && user?.role === "employer") router.replace("/portal");
  }, [loading, user, router]);

  return (
    <main className="py-16 px-4" dir="rtl">
      <Card className="max-w-md mx-auto p-8">
        <h1 className="font-display text-2xl text-ink-900 mb-1 text-center">
          הרשמת מעסיק
        </h1>
        <p className="text-sm text-ink-500 mb-6 text-center leading-relaxed">
          פתחו חשבון מעסיק. לאחר אימות קצר של הצוות תוכלו להתחבר ולפרסם משרות.
        </p>

        <EmployerRegisterForm />

        <p className="text-sm text-ink-500 mt-6 text-center">
          כבר יש לכם חשבון?{" "}
          <Link
            href="/portal/login"
            className="font-semibold text-navy-600 hover:underline"
          >
            כניסה לפורטל ←
          </Link>
        </p>
      </Card>
    </main>
  );
}
