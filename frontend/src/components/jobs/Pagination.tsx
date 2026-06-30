import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** הפילטרים הפעילים שיש לשמר בקישורים (field/region/experience). */
  params: Record<string, string | undefined>;
}

/** בונה href ל-/jobs תוך שימור הפילטרים הפעילים + מספר העמוד. */
function hrefFor(
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

/** מספרי העמודים להצגה — חלון סביב הנוכחי עם … לקיצור כשיש הרבה עמודים. */
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

/** עימוד לוח המשרות — קישורי ?page המשמרים את הסינון. RTL: "הבא" משמאל. */
export function Pagination({
  currentPage,
  totalPages,
  params,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5 mt-12"
      aria-label="ניווט בין עמודי המשרות"
    >
      {currentPage > 1 ? (
        <Link
          href={hrefFor(params, currentPage - 1)}
          rel="prev"
          className={`${cell} text-ink-700 hover:bg-sand-100`}
        >
          הקודם
        </Link>
      ) : (
        <span
          className={`${cell} text-ink-300 cursor-not-allowed`}
          aria-disabled="true"
        >
          הקודם
        </span>
      )}

      {pageWindow(currentPage, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-ink-400 select-none">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${cell} bg-navy-600 text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(params, p)}
            className={`${cell} text-ink-700 hover:bg-sand-100`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={hrefFor(params, currentPage + 1)}
          rel="next"
          className={`${cell} text-ink-700 hover:bg-sand-100`}
        >
          הבא
        </Link>
      ) : (
        <span
          className={`${cell} text-ink-300 cursor-not-allowed`}
          aria-disabled="true"
        >
          הבא
        </span>
      )}
    </nav>
  );
}
