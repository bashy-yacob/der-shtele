import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** שדה קלט עם label ושגיאה — נגיש (label מקושר). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    // אם לא הועבר id — מייצרים אחד יציב כדי שה-label יקושר לשדה (a11y).
    const reactId = useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 placeholder:text-ink-400",
            "focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className,
          )}
          {...props}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
