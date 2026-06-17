"use client";

import { useState } from "react";
import Link from "next/link";
import { updateReminder } from "@/lib/admin-api";
import type { Reminder } from "@/types";
import { formatDateTime } from "@/lib/utils";

/**
 * התראת תזכורות צפה — כרטיס קטן בפינה השמאלית התחתונה (לא תופס מקום מהתוכן).
 * ניתן למזער לכפתור קטן. מופיע בכל עמוד דרך GlobalReminderAlert.
 */
export function DueRemindersBanner({
  due,
  onChanged,
}: {
  due: Reminder[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
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

  // מצב ממוזער — כפתור עגול קטן עם מונה
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-red-500 text-white shadow-lg px-4 py-2.5 text-sm font-bold hover:bg-red-600 transition-colors"
        aria-label="הצג תזכורות ממתינות"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        {due.length} תזכורות
      </button>
    );
  }

  const shown = due.slice(0, 3);

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-red-300 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-red-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          {due.length === 1
            ? "תזכורת ממתינה לטיפול"
            : `${due.length} תזכורות ממתינות`}
        </h2>
        <button
          onClick={() => setMinimized(true)}
          className="text-ink-400 hover:text-ink-700 text-lg leading-none px-1"
          aria-label="מזער"
          title="מזער"
        >
          —
        </button>
      </div>

      <ul className="space-y-1.5">
        {shown.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-red-50 px-2.5 py-1.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-900 truncate">
                {r.message}
              </p>
              <p className="text-[11px] text-ink-400">
                {formatDateTime(r.remindAt)}
              </p>
            </div>
            <button
              onClick={() => markDone(r.id)}
              disabled={busyId === r.id}
              className="shrink-0 rounded-md border border-olive-500 px-2 py-1 text-[11px] font-bold text-olive-700 hover:bg-olive-50 disabled:opacity-50 transition-colors"
            >
              {busyId === r.id ? "..." : "בוצע"}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between">
        {due.length > shown.length ? (
          <span className="text-[11px] text-red-700">
            ועוד {due.length - shown.length}
          </span>
        ) : (
          <span />
        )}
        <Link
          href="/admin/reminders"
          className="text-xs font-semibold text-red-700 hover:underline"
        >
          לכל התזכורות ←
        </Link>
      </div>
    </div>
  );
}
