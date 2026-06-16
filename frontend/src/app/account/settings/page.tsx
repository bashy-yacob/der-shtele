'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, updateMarketing } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // טוען את הערך האמיתי מהמשתמש כשהוא נטען (לא ערך קשיח).
  useEffect(() => {
    if (typeof user?.optInMarketing === 'boolean') {
      setOptIn(user.optInMarketing);
    }
  }, [user?.optInMarketing]);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMarketing(optIn);
      setMessage('ההעדפה נשמרה בהצלחה.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'שגיאה בשמירה.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">הגדרות</h1>
      <Card className="space-y-4">
        <h2 className="font-bold text-neutral-800">העדפות עדכונים</h2>
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-1 accent-primary-600"
          />
          <span>קבלת עדכונים על משרות רלוונטיות בדואר אלקטרוני (opt-out בכל עת).</span>
        </label>
        <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? 'שומר...' : 'שמירת שינויים'}
        </Button>
        {message && <p className="text-sm text-neutral-600">{message}</p>}
      </Card>
    </div>
  );
}
