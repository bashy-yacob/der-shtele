"use client";

// אימות כתובת מייל (סעיף 3.1): המשתמש מגיע לכאן מהקישור במייל עם ?token=...
// כאן (client) שולחים את הטוקן ל-proxy ומציגים את התוצאה. הקריאה same-origin.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("קישור האימות אינו תקין — חסר טוקן.");
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (res.ok) {
          setStatus("success");
          setMessage(
            json?.data?.message ?? json?.message ?? "כתובת המייל אומתה בהצלחה.",
          );
        } else {
          setStatus("error");
          setMessage(
            json?.error ??
              json?.message ??
              "קישור האימות אינו תקף או שכבר נוצל.",
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("אירעה שגיאה באימות. נסה שוב מאוחר יותר.");
      });
  }, []);

  return (
    <main className="py-16 px-4" dir="rtl">
      <Card className="max-w-md mx-auto p-8 text-center">
        {status === "loading" && (
          <p className="text-ink-500">מאמת את כתובת המייל...</p>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-3">✓</div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">
              הכתובת אומתה
            </h1>
            <p className="text-ink-500 mb-6">{message}</p>
            <Link href="/account">
              <Button>לאזור האישי ←</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-ink-900 mb-2">
              האימות נכשל
            </h1>
            <p className="text-ink-500 mb-6">{message}</p>
            <Link href="/account">
              <Button variant="secondary">לאזור האישי</Button>
            </Link>
          </>
        )}
      </Card>
    </main>
  );
}
