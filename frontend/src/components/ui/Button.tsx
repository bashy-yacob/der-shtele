import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

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

/** כפתור בסיס — primary (navy) / secondary (olive) / outline / ghost. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
