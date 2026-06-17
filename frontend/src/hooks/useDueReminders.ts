"use client";

import { useCallback, useEffect, useState } from "react";
import { listReminders } from "@/lib/admin-api";
import type { Reminder } from "@/types";

/**
 * טוען תזכורות פתוחות וגוזר את אלה שהגיע זמנן (remindAt <= עכשיו).
 * מתרענן כל דקה כדי שתזכורת שמגיע זמנה "תקפוץ" גם בלי רענון ידני.
 */
export function useDueReminders(enabled = true, pollMs = 60_000) {
  const [open, setOpen] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    if (!enabled) return;
    listReminders(false)
      .then(setOpen)
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [enabled, load, pollMs]);

  const now = Date.now();
  const due = open.filter((r) => new Date(r.remindAt).getTime() <= now);

  return { open, due, dueCount: due.length, loaded, refresh: load };
}
