'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const registerSchema = z.object({
  fullName: z.string().min(2, 'נא להזין שם מלא'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים'),
  // opt-in חובה — חייב להיות מסומן
  optInMarketing: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר קבלת עדכונים כדי להירשם' }),
  }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterValues) => {
    try {
      setError(null);
      await registerUser(data);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהרשמה');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        id="fullName"
        label="שם מלא"
        {...register('fullName')}
        error={errors.fullName?.message}
      />
      <Input
        id="email"
        type="email"
        label="דואר אלקטרוני"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        id="password"
        type="password"
        label="סיסמה"
        {...register('password')}
        error={errors.password?.message}
      />

      {/* opt-in חובה */}
      <div>
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            {...register('optInMarketing')}
            className="mt-1 accent-primary-600"
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
        {isSubmitting ? 'נרשם...' : 'הרשמה'}
      </Button>
    </form>
  );
}
