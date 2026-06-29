"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  employerRegisterSchema,
  type EmployerRegisterValues,
} from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/** טופס הרשמת מעסיק עצמית (סעיף 6) — נפתח חשבון pending עד אישור הצוות. */
export function EmployerRegisterForm() {
  const router = useRouter();
  const { registerEmployer } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployerRegisterValues>({
    resolver: zodResolver(employerRegisterSchema),
  });

  const onSubmit = async (data: EmployerRegisterValues) => {
    try {
      setError(null);
      await registerEmployer({
        companyName: data.companyName,
        contactName: data.contactName,
        contactPhone: data.phone,
        email: data.email,
        password: data.password,
        optInMarketing: data.optInMarketing,
      });
      // נכנס מיד לפורטל — שם יוצג מסך "ממתין לאישור" עד שהצוות יאשר.
      router.push("/portal");
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
        id="companyName"
        label="שם החברה"
        {...register("companyName")}
        error={errors.companyName?.message}
      />
      <Input
        id="contactName"
        label="איש קשר"
        {...register("contactName")}
        error={errors.contactName?.message}
      />
      <Input
        id="phone"
        type="tel"
        label="טלפון"
        placeholder="050-0000000"
        {...register("phone")}
        error={errors.phone?.message}
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
            אני מאשר/ת קבלת עדכונים ופניות מהצוות בדואר אלקטרוני (חובה).
          </span>
        </label>
        {errors.optInMarketing && (
          <p className="text-red-600 text-xs mt-1">
            {errors.optInMarketing.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "נרשם..." : "פתיחת חשבון מעסיק"}
      </Button>
    </form>
  );
}
