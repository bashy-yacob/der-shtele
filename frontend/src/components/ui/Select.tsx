import { cn } from "@/lib/utils";
import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

/** רשימה נפתחת עם label ושגיאה — תואם react-hook-form. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    // אם לא הועבר id — מייצרים אחד יציב כדי שה-label יקושר לשדה (a11y).
    const reactId = useId();
    const selectId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900",
            "focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
