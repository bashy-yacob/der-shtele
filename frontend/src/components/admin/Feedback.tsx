// רכיבי מצב משותפים לדשבורד — טעינה, ריק, שגיאה, כותרת עמוד.
import type { ReactNode } from "react";
import { CircleNotch, Tray, WarningCircle, CheckCircle } from "@/lib/icons";

/** מצב טעינה. */
export function Loading({ label = "טוען..." }: { label?: string }) {
  return (
    <div className="py-16 flex items-center justify-center gap-2 text-ink-500 text-sm">
      <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
      {label}
    </div>
  );
}

/** מצב ריק — אין נתונים להצגה. */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 flex flex-col items-center gap-3 text-center text-ink-400 text-sm border border-dashed border-sand-300 rounded-2xl">
      <Tray className="w-10 h-10 text-sand-400" />
      <span>{message}</span>
    </div>
  );
}

/** הודעת שגיאה. */
export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
      <WarningCircle className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** הודעת הצלחה. */
export function SuccessNote({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-olive-50 border border-olive-300 text-olive-700 text-sm rounded-xl px-4 py-3">
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** כותרת עמוד עם תיאור ופעולה אופציונלית. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-display text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
