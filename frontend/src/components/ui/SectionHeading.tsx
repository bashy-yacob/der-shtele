import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** טקסט "eyebrow" קטן מעל הכותרת (olive). */
  eyebrow?: string;
  /** הכותרת הראשית (font-display). */
  title: ReactNode;
  /** תת-כותרת אופציונלית מתחת לכותרת. */
  subtitle?: ReactNode;
  /** יישור התוכן. */
  align?: "start" | "center";
  className?: string;
}

/** כותרת סקשן עקבית — eyebrow ב-olive + כותרת סריף + תת-כותרת. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center"
          ? "items-center text-center"
          : "items-start text-start",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-olive-600 text-sm font-bold tracking-wide uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-ink-900 text-3xl sm:text-4xl font-bold leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-ink-500 text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
