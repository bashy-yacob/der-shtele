'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [optIn, setOptIn] = useState(true);

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
        {/* TODO: PATCH /api/auth/me — שמירת ההעדפה */}
        <Button className="w-full sm:w-auto">שמירת שינויים</Button>
      </Card>
    </div>
  );
}
