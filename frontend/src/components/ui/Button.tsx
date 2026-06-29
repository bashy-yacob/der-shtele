import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** אייקון בתחילת הכפתור (צד פתיחה — RTL: ימין). */
  icon?: ReactNode;
  /** אייקון בסוף הכפתור (צד סיום — RTL: שמאל), נפוץ לחיצי "המשך". */
  iconEnd?: ReactNode;
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy-600 hover:bg-navy-700 text-white",
  secondary: "bg-olive-500 hover:bg-olive-600 text-white",
  outline: "border border-navy-600 text-navy-600 hover:bg-navy-50",
  ghost: "text-navy-600 hover:bg-navy-50",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-4 py-2 rounded-lg",
  md: "px-6 py-2.5 rounded-xl",
  lg: "text-lg px-8 py-3.5 rounded-xl",
};

/**
 * מחזיר את מחלקות הכפתור הקנוני — לשימוש כש-`<Button>` עצמו לא מתאים
 * (למשל `<Link>` או `<a>` שצריך להיראות ככפתור). שומר על שפה עיצובית אחת.
 */
export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

/** כפתור בסיס — primary (navy) / secondary (olive) / outline / ghost. תומך באייקון בתחילה/בסוף. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  icon,
  iconEnd,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {icon}
      {children}
      {iconEnd}
    </button>
  );
}
