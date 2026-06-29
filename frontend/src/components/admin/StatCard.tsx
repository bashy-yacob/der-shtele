import { cn } from "@/lib/utils";
import type { Icon } from "@/lib/icons";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "warn";
  icon?: Icon;
}

const TONES = {
  default: "border-sand-200",
  accent: "border-olive-300",
  warn: "border-red-200",
} as const;

// גוון המדליון לפי tone הכרטיס
const ICON_TONES = {
  default: "bg-navy-50 text-navy-600",
  accent: "bg-olive-100 text-olive-700",
  warn: "bg-red-50 text-red-600",
} as const;

/** כרטיס מדד יחיד ללוח הבקרה. */
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-soft p-5 flex items-start gap-3",
        TONES[tone],
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
            ICON_TONES[tone],
          )}
        >
          <Icon className="w-[1.4rem] h-[1.4rem]" />
        </span>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-ink-500 font-semibold">{label}</span>
        <span className="text-3xl font-display text-ink-900">{value}</span>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
    </div>
  );
}
