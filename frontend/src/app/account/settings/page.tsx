"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, updateMarketing, changePassword } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // טוען את הערך האמיתי מהמשתמש כשהוא נטען (לא ערך קשיח).
  useEffect(() => {
    if (typeof user?.optInMarketing === "boolean") {
      setOptIn(user.optInMarketing);
    }
  }, [user?.optInMarketing]);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMarketing(optIn);
      setMessage("ההעדפה נשמרה בהצלחה.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "שגיאה בשמירה.");
    } finally {
      setSaving(false);
    }
  };

  // --- שינוי סיסמה ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState(false);

  const onChangePassword = async () => {
    setPwMessage(null);
    setPwError(false);
    if (newPassword.length < 8) {
      setPwError(true);
      setPwMessage("הסיסמה החדשה חייבת להכיל לפחות 8 תווים.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(true);
      setPwMessage("הסיסמה החדשה והאישור אינם תואמים.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwMessage("הסיסמה עודכנה בהצלחה.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(true);
      setPwMessage(err instanceof Error ? err.message : "שגיאה בעדכון הסיסמה.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">הגדרות</h1>
      <Card className="space-y-4">
        <h2 className="font-display text-lg text-ink-900">העדפות עדכונים</h2>
        <label className="flex items-start gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-1 accent-navy-600"
          />
          <span>
            קבלת עדכונים על משרות רלוונטיות בדואר אלקטרוני (opt-out בכל עת).
          </span>
        </label>
        <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "שומר..." : "שמירת שינויים"}
        </Button>
        {message && <p className="text-sm text-ink-700">{message}</p>}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg text-ink-900">שינוי סיסמה</h2>
        <Input
          id="currentPassword"
          type="password"
          label="סיסמה נוכחית"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          id="newPassword"
          type="password"
          label="סיסמה חדשה"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="אישור סיסמה חדשה"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          onClick={onChangePassword}
          disabled={
            pwSaving || !currentPassword || !newPassword || !confirmPassword
          }
          className="w-full sm:w-auto"
        >
          {pwSaving ? "מעדכן..." : "עדכון סיסמה"}
        </Button>
        {pwMessage && (
          <p
            className={
              pwError ? "text-sm text-red-600" : "text-sm text-olive-700"
            }
          >
            {pwMessage}
          </p>
        )}
      </Card>
    </div>
  );
}
