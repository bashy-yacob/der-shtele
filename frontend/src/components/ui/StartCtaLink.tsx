"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface StartCtaLinkProps {
  /** היעד הסופי אחרי הרשמה/כניסה — מחובר מגיע לשם ישירות. */
  dest: string;
  className?: string;
  children: ReactNode;
}

/**
 * קישור CTA מודע-הרשמה: משתמש מחובר מגיע ישר ליעד (dest) בלי לעבור שוב דרך
 * ההרשמה; משתמש לא-מחובר נשלח ל-/register עם ?redirect ליעד, וכך אחרי ההרשמה
 * הוא ממשיך בדיוק לאותו יעד (safeRedirect מכבד את ה-redirect). מונע את התקלה
 * של "רשום-כבר נשלח שוב להרשמה" ואת הנחיתה על /account במקום היעד המבוקש.
 *
 * הערה: בזמן טעינת מצב ההתחברות user עדיין null, ולכן ה-href נבנה כ-/register;
 * גם אם משתמש מחובר יילחץ בחלון הזה, RegisterForm יזהה שהוא מחובר ויפנה אותו
 * מיד ליעד לפי אותו redirect — כך שהתוצאה זהה.
 */
export function StartCtaLink({ dest, className, children }: StartCtaLinkProps) {
  const { user } = useAuth();
  const href = user ? dest : `/register?redirect=${encodeURIComponent(dest)}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
