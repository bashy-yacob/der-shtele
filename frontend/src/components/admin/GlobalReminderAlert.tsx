"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDueReminders } from "@/hooks/useDueReminders";
import { DueRemindersBanner } from "./DueRemindersBanner";

const ADMIN_ROLES = ["staff", "admin"];

/**
 * התראת תזכורות גלובלית — מופיעה בראש כל עמוד באתר כשמחובר/ת חבר/ת צוות
 * ויש תזכורות שהגיע זמנן. כך התזכורת "קופצת" בלי קשר לאן המנהל ניווט.
 * לגולש רגיל / לא מחובר — לא מוצג דבר.
 */
export function GlobalReminderAlert() {
  const { user } = useAuth();
  const authorized = !!user && ADMIN_ROLES.includes(user.role);
  const { due, refresh } = useDueReminders(authorized);

  if (!authorized || due.length === 0) return null;

  // הכרטיס ממקם את עצמו (fixed bottom-left) — אין צורך ב-wrapper שתופס מקום.
  return <DueRemindersBanner due={due} onChanged={refresh} />;
}
