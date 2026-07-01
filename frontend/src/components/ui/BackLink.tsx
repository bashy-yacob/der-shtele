import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@/lib/icons";

/**
 * קישור "חזרה" עקבי ל-RTL: אייקון Phosphor (CaretRight) בצד הפתיחה (ימין ב-RTL)
 * במקום גליף → / ← ידני שמתהפך לא נכון בין דפדפנים. הטקסט מגיע כ-children.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-sm text-navy-600 hover:underline mb-4 ${className ?? ""}`}
    >
      <CaretRight className="w-4 h-4 shrink-0" weight="bold" />
      {children}
    </Link>
  );
}
