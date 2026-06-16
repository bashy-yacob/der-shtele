import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/** כרטיס בסיס — רקע לבן, מסגרת sand עדינה, צל רך חמים. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-sand-200 shadow-soft p-6",
        className,
      )}
      {...props}
    />
  );
}
