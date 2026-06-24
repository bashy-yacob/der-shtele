"use client";

// באנר אימות מייל (סעיף 3.1) — מוצג באזור האישי כשכתובת המייל טרם אומתה.
// מאפשר שליחה חוזרת של מייל האימות. משתמשי Google מאומתים אוטומטית ולא יראו זאת.
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function EmailVerificationBanner() {
  const { user, getToken } = useAuth();
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");

  // מוצג רק כשידוע בוודאות שהכתובת לא אומתה.
  if (!user || user.emailVerified !== false) return null;

  const resend = async () => {
    setSending(true);
    setNote("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      }).then((r) => r.json().catch(() => null));
      setNote(
        res?.success
          ? "מייל אימות נשלח שוב — בדוק את תיבת הדואר."
          : "שליחת המייל נכשלה, נסה שוב מאוחר יותר.",
      );
    } catch {
      setNote("שגיאה בשליחת המייל.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">כתובת המייל טרם אומתה</p>
      <p className="mt-1 leading-relaxed">
        שלחנו קישור אימות לכתובת <span className="font-medium">{user.email}</span>.
        לא קיבלת?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={sending}
          className="font-semibold underline hover:no-underline disabled:opacity-60"
        >
          {sending ? "שולח..." : "שליחה חוזרת"}
        </button>
      </p>
      {note && <p className="mt-2 text-amber-800">{note}</p>}
    </div>
  );
}
