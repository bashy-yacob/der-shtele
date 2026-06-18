"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listContacts } from "@/lib/admin-api";
import type { Contact } from "@/types";
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

// בונה קישור לטופס "משרה חדשה" עם כל פרטי הפנייה המובְנים — טעינה מראש מלאה,
// בלי פענוח טקסט. הצוות מגיע לטופס כשהכל כבר ממולא.
function buildJobLink(c: Contact): string {
  const params = new URLSearchParams();
  params.set("contactName", c.name);
  params.set("phone", c.phone);
  if (c.companyName) params.set("company", c.companyName);
  if (c.email) params.set("email", c.email);
  if (c.businessNumber) params.set("businessNumber", c.businessNumber);
  if (c.companyLocation) params.set("address", c.companyLocation);
  if (c.jobTitle) params.set("title", c.jobTitle);
  if (c.field) params.set("field", c.field);
  if (c.region) params.set("region", c.region);
  if (c.scope) params.set("scope", c.scope);
  if (c.experience) params.set("experience", c.experience);
  if (c.salary) params.set("salary", c.salary);
  if (c.message) params.set("description", c.message);
  return `/admin/jobs/new?${params.toString()}`;
}

// שורת פרט — מוצגת רק אם יש ערך.
function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-ink-400 shrink-0">{label}:</span>
      {href ? (
        <a href={href} className="text-navy-600 hover:underline" dir="ltr">
          {value}
        </a>
      ) : (
        <span className="text-ink-800 font-medium">{value}</span>
      )}
    </div>
  );
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

              {c.inquiry_type === "employer" ? (
                <>
                  {/* פרטים מובְנים — כל מה שהצוות צריך לפתיחת המשרה */}
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl bg-sand-50 border border-sand-200 p-3">
                    <Detail label="חברה" value={c.companyName} />
                    <Detail label="ח.פ / עוסק" value={c.businessNumber} />
                    <Detail label="מיקום" value={c.companyLocation} />
                    <Detail
                      label="מייל"
                      value={c.email}
                      href={c.email ? `mailto:${c.email}` : undefined}
                    />
                    <Detail label="תפקיד" value={c.jobTitle} />
                    <Detail
                      label="תחום"
                      value={c.field ? FIELD_LABELS[c.field] : undefined}
                    />
                    <Detail label="אזור" value={c.region} />
                    <Detail label="היקף" value={c.scope} />
                    <Detail label="ניסיון נדרש" value={c.experience} />
                    <Detail label="טווח שכר" value={c.salary} />
                  </div>

                  {c.message && (
                    <div>
                      <p className="text-xs text-ink-400 mb-1">
                        תיאור המשרה והדרישות:
                      </p>
                      <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                        {c.message}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <Link href={buildJobLink(c)}>
                      <Button size="sm" variant="outline">
                        צור משרה מפנייה זו ←
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                  {c.message}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
