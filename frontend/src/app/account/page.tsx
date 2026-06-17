"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";

export default function AccountProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">הפרופיל שלי</h1>
      <Card className="space-y-3">
        <Field label="דואר אלקטרוני" value={user?.email ?? "—"} />
        <Field
          label="תפקיד"
          value={user?.role === "candidate" ? "מועמד" : (user?.role ?? "—")}
        />
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 border-b border-sand-200 pb-2 last:border-0">
      <span className="text-ink-500 text-sm shrink-0">{label}</span>
      <span className="font-medium text-ink-900 text-end break-words min-w-0">
        {value}
      </span>
    </div>
  );
}
