"use client";

import { useEffect, useState } from "react";
import { listReminders, createReminder, updateReminder } from "@/lib/admin-api";
import type { Reminder } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [includeDone, setIncludeDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = (withDone = includeDone) =>
    listReminders(withDone)
      .then(setReminders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async () => {
    if (message.trim().length < 2 || !remindAt) {
      setError("יש למלא תוכן תזכורת ותאריך");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createReminder({
        message,
        remindAt: new Date(remindAt).toISOString(),
        createdBy: user?.fullName || user?.email || "צוות",
      });
      setMessage("");
      setRemindAt("");
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const markDone = async (id: string) => {
    try {
      await updateReminder(id, { done: true });
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const toggleDone = () => {
    const next = !includeDone;
    setIncludeDone(next);
    setLoading(true);
    reload(next);
  };

  return (
    <div>
      <PageHeader
        title="תזכורות"
        subtitle="שיחות חוזרות, מעקבים ופניות תלויות"
        action={
          <Button variant="ghost" onClick={toggleDone}>
            {includeDone ? "הסתר שטופלו" : "הצג גם שטופלו"}
          </Button>
        }
      />

      <Card className="mb-6 space-y-3">
        <h2 className="text-lg font-display text-ink-900">תזכורת חדשה</h2>
        <Input
          label="תוכן"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="למשל: לחזור למועמד בנושא ראיון"
        />
        <Input
          type="datetime-local"
          label="מועד התזכורת"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
        />
        {error && <ErrorNote message={error} />}
        <Button onClick={add} disabled={busy}>
          {busy ? "מוסיף..." : "הוספת תזכורת"}
        </Button>
      </Card>

      {loading ? (
        <Loading />
      ) : reminders.length === 0 ? (
        <EmptyState message="אין תזכורות להצגה" />
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const overdue = !r.done && new Date(r.remindAt) < new Date();
            return (
              <Card
                key={r.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p
                    className={`text-sm ${r.done ? "text-ink-400 line-through" : "text-ink-900"}`}
                  >
                    {r.message}
                  </p>
                  <p className="text-xs text-ink-400">
                    {formatDateTime(r.remindAt)} · {r.createdBy}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.done ? (
                    <StatusBadge status="completed" label="טופל" />
                  ) : (
                    <>
                      {overdue && (
                        <StatusBadge status="cancelled" label="באיחור" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markDone(r.id)}
                      >
                        סמן כטופל
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
