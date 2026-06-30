"use client";

// עימוד קליל לרשימות הדשבורד — מבוסס callback (state מקומי), לא קישורי URL.
import { cn } from "@/lib/utils";

interface AdminPagerProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

/** מספרי העמודים להצגה — חלון סביב הנוכחי עם … כשיש הרבה עמודים. */
function pageWindow(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) out.push("…");
  for (let p = left; p <= right; p++) out.push(p);
  if (right < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

const cell =
  "min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors";

/** עימוד רשימות הדשבורד. RTL: "הבא" משמאל. אינו מרונדר כשיש עמוד אחד בלבד. */
export function AdminPager({ page, totalPages, onPage }: AdminPagerProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="ניווט בין עמודים"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className={cn(
          cell,
          "text-ink-700 hover:bg-sand-100 disabled:text-ink-300 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        )}
      >
        הקודם
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="select-none px-1.5 text-ink-400">
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={cn(cell, "bg-navy-600 text-white")}
          >
            {p}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={cn(cell, "text-ink-700 hover:bg-sand-100")}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          cell,
          "text-ink-700 hover:bg-sand-100 disabled:text-ink-300 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        )}
      >
        הבא
      </button>
    </nav>
  );
}
