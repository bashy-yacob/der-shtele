"use client";

// תזכורת opt-in עדינה באזור האישי. מיועדת בעיקר למשתמשי Google שנרשמו בלי
// הסכמה לדיוור (הרשמה רגילה ממילא דורשת אישור). מופיעה מיד בכניסה הראשונה,
// ואז חוזרת רק אחרי ~30 יום — לא מטרידה בכל ביקור.
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function OptInReminder() {
  const { user, updateMarketing, markOptInPrompted } = useAuth();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const decided = useRef(false);

  useEffect(() => {
    if (decided.current || !user || user.optInMarketing) return;

    const last = user.optInPromptedAt
      ? new Date(user.optInPromptedAt).getTime()
      : 0;
    const due = !last || Date.now() - last >= THIRTY_DAYS_MS;
    if (!due) return;

    decided.current = true;
    setShow(true);
    // מסמנים שהתזכורת הוצגה — מאפס את הספירה ל-~30 יום הבאים (גם אם יתעלם).
    void markOptInPrompted();
  }, [user, markOptInPrompted]);

  if (!show) return null;

  const accept = async () => {
    setBusy(true);
    try {
      await updateMarketing(true);
      setShow(false);
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-sand-200 bg-navy-50 p-4 sm:p-5">
      <p className="font-display text-base font-bold text-ink-900">
        לקבל עדכונים על משרות שמתאימות לך?
      </p>
      <p className="mt-1 text-sm text-ink-700">
        נשלח אליך מייל רק כשתהיה התאמה אמיתית — בלי הצפות, ובלי מיילים בשבת ובחגים.
        אפשר לבטל בכל רגע מההגדרות.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={accept} disabled={busy}>
          {busy ? "שומר..." : "כן, אשמח לקבל"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShow(false)}
          disabled={busy}
        >
          לא תודה
        </Button>
      </div>
    </div>
  );
}
