'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';

export default function AccountProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">הפרופיל שלי</h1>
      <Card className="space-y-3">
        <Field label="דואר אלקטרוני" value={user?.email ?? '—'} />
        <Field label="תפקיד" value={user?.role === 'candidate' ? 'מועמד' : (user?.role ?? '—')} />
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
      <span className="text-neutral-500 text-sm">{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
    </div>
  );
}
