'use client';

import { Card } from '@/components/ui/Card';

export default function MyApplicationsPage() {
  // TODO: שליפת ההגשות של המועמד המחובר מה-backend (GET /api/candidates/me/applications)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">ההגשות שלי</h1>
      <Card className="text-center text-neutral-500 py-12">
        עדיין לא הגשת מועמדות. עיין/ני ב
        <a href="/jobs" className="text-primary-600 font-semibold hover:underline">
          {' '}לוח המשרות
        </a>
        .
      </Card>
    </div>
  );
}
