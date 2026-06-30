import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface CityComboboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** הערים הקיימות לבחירה. עיר שלא ברשימה נשמרת כמו שהיא ומתווספת בפעם הבאה. */
  options: string[];
}

/**
 * שדה עיר/אזור: בחירה מרשימה קיימת או הקלדת עיר חדשה (datalist נייטיב).
 * עיר חדשה שאינה ברשימה נשמרת כמו שהיא — ומופיעה אוטומטית ברשימה בפעם הבאה.
 * תואם react-hook-form (forwardRef) וגם שימוש מבוקר (value/onChange).
 */
export const CityCombobox = forwardRef<HTMLInputElement, CityComboboxProps>(
  ({ label, error, options, id, className, ...props }, ref) => {
    const listId = useId();
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          list={listId}
          autoComplete="off"
          placeholder="בחר עיר או הקלד עיר חדשה"
          className={cn(
            "w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 placeholder:text-ink-400",
            "focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 focus:outline-none transition-all",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className,
          )}
          {...props}
        />
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

CityCombobox.displayName = "CityCombobox";
