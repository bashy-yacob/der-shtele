import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = { title: "הרשמה" };

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-[70vh] items-center justify-center px-4 py-16"
      dir="rtl"
    >
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
          יצירת חשבון
        </h1>
        <p className="text-sm text-ink-500 mb-6">
          הרשמה מאפשרת לעקוב אחר ההגשות ולשמור משרות.
        </p>
        <RegisterForm />
        <p className="text-sm text-ink-700 text-center mt-6">
          כבר רשום/ה?{" "}
          <Link
            href="/login"
            className="text-navy-600 font-semibold hover:underline"
          >
            התחברות
          </Link>
        </p>
      </Card>
    </main>
  );
}
