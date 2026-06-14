import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

/** כרטיס בסיס — רקע לבן, מסגרת עדינה, צל קל. */
export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-neutral-200 shadow-sm p-6',
        className,
      )}
      {...props}
    />
  );
}
