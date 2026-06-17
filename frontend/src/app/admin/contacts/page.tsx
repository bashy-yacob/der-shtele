"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listContacts } from "@/lib/admin-api";
import type { Contact, JobField } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button } from "@/components/ui";
import { INQUIRY_TYPE_LABELS, FIELD_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

// טופס פניית המעסיק (employers/contact) דוחס את פרטי המשרה להודעה מובנית.
// כאן מפענחים אותה בחזרה כדי לטעון מראש את טופס יצירת המשרה.
function parseEmployerInquiry(message: string) {
  const line = (label: string) => {
    const m = message.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };
  const fieldLabel = line("תחום");
  const field =
    (Object.entries(FIELD_LABELS).find(([, v]) => v === fieldLabel)?.[0] as
      | JobField
      | undefined) ?? "";
  const parts = message.split("תיאור המשרה:");
  return {
    company: line("חברה"),
    field,
    region: line("אזור"),
    scope: line("היקף"),
    description: parts.length > 1 ? parts[1].trim() : "",
  };
}

// בונה קישור לטופס "משרה חדשה" עם הפרטים שאפשר לחלץ מהפנייה.
function buildJobLink(c: Contact): string {
  const p = parseEmployerInquiry(c.message);
  const params = new URLSearchParams();
  params.set("contactName", c.name);
  params.set("phone", c.phone);
  if (p.company) params.set("company", p.company);
  if (p.field) params.set("field", p.field);
  if (p.region) params.set("region", p.region);
  if (p.scope) params.set("scope", p.scope);
  if (p.description) params.set("description", p.description);
  return `/admin/jobs/new?${params.toString()}`;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContacts()
      .then(setContacts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="פניות נכנסות"
        subtitle={`${contacts.length} פניות מטופס "צור קשר" ומטופס המעסיקים`}
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : contacts.length === 0 ? (
        <EmptyState message="עדיין אין פניות." />
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    status={c.inquiry_type}
                    label={INQUIRY_TYPE_LABELS[c.inquiry_type] ?? "פנייה"}
                  />
                  <span className="font-semibold text-ink-900">{c.name}</span>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-sm text-navy-600 hover:underline"
                    dir="ltr"
                  >
                    {c.phone}
                  </a>
                  {c.resumePath && (
                    <span className="text-xs text-olive-700 bg-olive-50 border border-olive-200 rounded-full px-2 py-0.5">
                      צורפו קו״ח
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink-400 whitespace-nowrap">
                  {formatDate(c.createdAt)}
                </span>
              </div>

              <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                {c.message}
              </p>

              {c.inquiry_type === "employer" && (
                <div className="pt-1">
                  <Link href={buildJobLink(c)}>
                    <Button size="sm" variant="outline">
                      צור משרה מפנייה זו ←
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
