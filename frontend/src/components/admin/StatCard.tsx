import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "warn";
}

const TONES = {
  default: "border-sand-200",
  accent: "border-olive-300",
  warn: "border-red-200",
} as const;

/** כרטיס מדד יחיד ללוח הבקרה. */
export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-soft p-5 flex flex-col gap-1",
        TONES[tone],
      )}
    >
      <span className="text-sm text-ink-500 font-semibold">{label}</span>
      <span className="text-3xl font-display text-ink-900">{value}</span>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}
