"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { buttonClass } from "@/components/ui/Button";

interface SendCvCtaProps {
  label: string;
  className?: string;
}

/**
 * כפתור "הרשמה ושליחת קו"ח" בעל מודעות התחברות (איפיון 1.1):
 * מחובר → ישר ל-/contact; לא-מחובר → /register?redirect=/contact, וכך אחרי
 * ההרשמה חוזר ל-/contact (safeRedirect מכבד את היעד). מצב טעינה נחשב כלא-מחובר —
 * חלון קצר שמתייצב מיד, וגם אם מחובר יגיע ל-/contact דרך ההפניה.
 */
export function SendCvCta({ label, className }: SendCvCtaProps) {
  const { user } = useAuth();
  const href = user ? "/contact" : "/register?redirect=/contact";
  return (
    <Link href={href} className={buttonClass("primary", "lg", className)}>
      {label}
    </Link>
  );
}
