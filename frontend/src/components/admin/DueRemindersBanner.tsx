"use client";

import { useState } from "react";
import Link from "next/link";
import { updateReminder } from "@/lib/admin-api";
import type { Reminder } from "@/types";
import { formatDateTime } from "@/lib/utils";

/**
 * התראה בולטת שמופיעה בראש כל מסך בדשבורד כשיש תזכורות שהגיע זמנן.
 * כך אף תזכורת "לבצע" לא נעלמת מעיני הצוות.
 */
export function DueRemindersBanner({
  due,
  onChanged,
}: {
  due: Reminder[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  if (due.length === 0) return null;

  const markDone = async (id: string) => {
    setBusyId(id);
    try {
      await updateReminder(id, { done: true });
      onChanged();
    } catch {
      // נכשל — נשאיר את ההתראה, ניסיון חוזר בלחיצה הבאה
    } finally {
      setBusyId(null);
    }
  };

  const shown = due.slice(0, 4);

  return (
    <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-red-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          {due.length === 1
            ? "תזכורת אחת ממתינה לטיפול"
            : `${due.length} תזכורות ממתינות לטיפול`}
        </h2>
        <Link
          href="/admin/reminders"
          className="text-sm font-semibold text-red-700 hover:underline whitespace-nowrap"
        >
          לכל התזכורות ←
        </Link>
      </div>

      <ul className="space-y-2">
        {shown.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900 truncate">
                {r.message}
              </p>
              <p className="text-xs text-ink-400">
                {formatDateTime(r.remindAt)} · {r.createdBy}
              </p>
            </div>
            <button
              onClick={() => markDone(r.id)}
              disabled={busyId === r.id}
              className="shrink-0 rounded-lg border border-olive-500 px-3 py-1.5 text-xs font-bold text-olive-700 hover:bg-olive-50 disabled:opacity-50 transition-colors"
            >
              {busyId === r.id ? "..." : "בוצע"}
            </button>
          </li>
        ))}
      </ul>

      {due.length > shown.length && (
        <p className="mt-2 text-xs text-red-700">
          ועוד {due.length - shown.length} תזכורות —{" "}
          <Link href="/admin/reminders" className="font-semibold underline">
            לצפייה בכולן
          </Link>
        </p>
      )}
    </div>
  );
}
