'use client';

import { Card } from '@/components/ui/Card';

export default function SavedJobsPage() {
  // TODO: שמירת/שליפת משרות שמורות (localStorage או backend)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">משרות שמורות</h1>
      <Card className="text-center text-neutral-500 py-12">
        אין משרות שמורות עדיין.
      </Card>
    </div>
  );
}
