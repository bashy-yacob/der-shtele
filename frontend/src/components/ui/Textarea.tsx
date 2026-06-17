import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/** שדה טקסט רב-שורתי — תואם react-hook-form. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-2.5 border border-sand-300 rounded-xl text-sm bg-white text-ink-900 placeholder:text-ink-400 min-h-[96px] resize-y",
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

Textarea.displayName = "Textarea";
