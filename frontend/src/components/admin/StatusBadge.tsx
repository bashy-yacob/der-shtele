import { cn } from "@/lib/utils";
import { STATUS_TONE } from "@/lib/labels";

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

/** תג סטטוס צבעוני — גוון נקבע לפי ערך הסטטוס (labels.STATUS_TONE). */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap",
        STATUS_TONE[status] ?? "bg-sand-100 text-ink-500",
        className,
      )}
    >
      {label}
    </span>
  );
}
