"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  /** "icon" — לב בלבד (כרטיס); "full" — לב + טקסט (דף משרה). */
  variant?: "icon" | "full";
  className?: string;
}

/** כפתור שמירת משרה (♡). מחייב התחברות — גולש לא מחובר מנותב לכניסה. */
export function SaveJobButton({
  jobId,
  variant = "icon",
  className,
}: SaveJobButtonProps) {
  const { isAuthed, isSaved, toggle } = useSavedJobs();
  const router = useRouter();
  const pathname = usePathname();

  const saved = isSaved(jobId);

  const onClick = (e: React.MouseEvent) => {
    // בתוך כרטיס עטוף בקישור — מונע ניווט לדף המשרה בלחיצה על הלב
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    void toggle(jobId);
  };

  const label = saved ? "הסר ממשרות שמורות" : "שמור משרה";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-bold border transition-colors",
          saved
            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            : "bg-white border-sand-300 text-ink-700 hover:border-red-300 hover:text-red-600",
          className,
        )}
      >
        <Heart filled={saved} />
        {saved ? "משרה שמורה" : "שמור משרה"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full w-9 h-9 border transition-colors",
        saved
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-sand-300 text-ink-400 hover:border-red-300 hover:text-red-500",
        className,
      )}
    >
      <Heart filled={saved} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
