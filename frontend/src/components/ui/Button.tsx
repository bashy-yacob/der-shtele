import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

/** כפתור בסיס — primary / outline, תואם לעיצוב השמרני. */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold px-6 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/10',
        variant === 'outline' &&
          'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
        className,
      )}
      {...props}
    />
  );
}
