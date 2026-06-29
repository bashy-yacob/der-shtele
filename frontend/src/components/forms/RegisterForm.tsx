"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { safeRedirect, defaultDestForRole } from "@/lib/redirect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const registerSchema = z.object({
  fullName: z.string().min(2, "נא להזין שם מלא"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
  // opt-in חובה — חייב להיות מסומן
  optInMarketing: z.literal(true, {
    errorMap: () => ({ message: "יש לאשר קבלת עדכונים כדי להירשם" }),
  }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  // כבר מחובר? לא להציג טופס הרשמה — להפנות ליעד שביקש (?redirect) או לפי תפקיד.
  // משמש גם אחרי הרשמה מוצלחת (register מעדכן את user) — הניווט מתבצע כאן בלבד.
  useEffect(() => {
    if (loading || !user) return;
    const raw = new URLSearchParams(window.location.search).get("redirect");
    router.replace(safeRedirect(raw, defaultDestForRole(user.role)));
  }, [loading, user, router]);

  const onSubmit = async (data: RegisterValues) => {
    try {
      setError(null);
      await registerUser(data);
      // הניווט מתבצע בשומר למעלה ברגע ש-user מתעדכן.
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהרשמה");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <Input
        id="fullName"
        label="שם מלא"
        {...register("fullName")}
        error={errors.fullName?.message}
      />
      <Input
        id="email"
        type="email"
        label="דואר אלקטרוני"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        id="password"
        type="password"
        label="סיסמה"
        {...register("password")}
        error={errors.password?.message}
      />

      {/* opt-in חובה */}
      <div className="rounded-xl border border-sand-200 bg-sand-50 p-3">
        <label className="flex items-start gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            {...register("optInMarketing")}
            className="mt-1 h-4 w-4 accent-navy-600"
          />
          <span>
            אני מאשר/ת קבלת עדכונים על משרות רלוונטיות בדואר אלקטרוני (חובה).
          </span>
        </label>
        {errors.optInMarketing && (
          <p className="text-red-600 text-xs mt-1">
            {errors.optInMarketing.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "נרשם..." : "הרשמה"}
      </Button>
    </form>
  );
}
