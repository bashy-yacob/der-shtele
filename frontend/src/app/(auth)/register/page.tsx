import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'הרשמה' };

export default function RegisterPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-16" dir="rtl">
      <Card>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">יצירת חשבון</h1>
        <p className="text-sm text-neutral-500 mb-6">
          הרשמה מאפשרת לעקוב אחר ההגשות ולשמור משרות.
        </p>
        <RegisterForm />
        <p className="text-sm text-neutral-600 text-center mt-6">
          כבר רשום/ה?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            התחברות
          </Link>
        </p>
      </Card>
    </main>
  );
}
