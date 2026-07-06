"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listContactsPaged,
  setContactHandled,
  getContactResume,
} from "@/lib/admin-api";
import type { Contact, InquiryType } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Select, Input } from "@/components/ui";
import { AdminPager } from "@/components/admin/AdminPager";
import { INQUIRY_TYPE_LABELS, FIELD_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 15;

// מצב סינון "טופל" — כל הפניות / רק שטופלו / רק שטרם טופלו.
type HandledFilter = "all" | "handled" | "open";

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
        <span className="text-ink-900 font-medium">{value}</span>
      )}
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InquiryType | "">("");
  const [handledFilter, setHandledFilter] = useState<HandledFilter>("all");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resumeBusyId, setResumeBusyId] = useState<string | null>(null);
  // שגיאת פעולה (סימון/פתיחת קו"ח) — נפרדת משגיאת הטעינה כדי לא להעלים את הרשימה.
  const [actionError, setActionError] = useState("");

  // debounce לחיפוש.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, typeFilter, handledFilter]);

  // טעינת עמוד מהשרת — כולל openCount (ממתינות לטיפול בכל המערכת).
  useEffect(() => {
    let alive = true;
    setLoading(true);
    listContactsPaged({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      type: typeFilter || undefined,
      handled: handledFilter === "all" ? undefined : handledFilter,
    })
      .then((res) => {
        if (!alive) return;
        setContacts(res.items);
        setTotal(res.total);
        setOpenCount(res.openCount);
        setError("");
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, typeFilter, handledFilter, refreshKey]);

  // סימון/ביטול "טופל" — טוען מחדש את העמוד (כדי שהסינון וה-openCount יתעדכנו).
  async function toggleHandled(c: Contact) {
    setBusyId(c.id);
    setActionError("");
    try {
      await setContactHandled(c.id, !c.handledAt);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  // פתיחת הקו"ח שצורף לפנייה — לשונית נפתחת מיד (כדי לא להיחסם ע"י חוסם-פופאפים).
  async function openResume(c: Contact) {
    setResumeBusyId(c.id);
    setActionError("");
    const tab = window.open("about:blank", "_blank");
    try {
      const { url } = await getContactResume(c.id);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (e) {
      tab?.close();
      setActionError((e as Error).message);
    } finally {
      setResumeBusyId(null);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!(debouncedSearch || typeFilter || handledFilter !== "all");

  return (
    <div>
      <PageHeader
        title="פניות נכנסות"
        subtitle={
          hasFilter
            ? `נמצאו ${total} פניות · ${openCount} ממתינות לטיפול`
            : `${total} פניות מטופס "צור קשר" ומטופס המעסיקים · ${openCount} ממתינות לטיפול`
        }
      />

      <Card className="mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <Input
            label="חיפוש"
            placeholder="שם / טלפון / חברה / מייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="סוג פנייה"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InquiryType | "")}
          >
            <option value="">כל סוגי הפניות</option>
            {Object.entries(INQUIRY_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            label="סטטוס טיפול"
            value={handledFilter}
            onChange={(e) => setHandledFilter(e.target.value as HandledFilter)}
          >
            <option value="all">טופלו ולא טופלו</option>
            <option value="open">ממתינות לטיפול</option>
            <option value="handled">טופלו</option>
          </Select>
        </div>
      </Card>

      {actionError && (
        <div className="mb-4">
          <ErrorNote message={actionError} />
        </div>
      )}

      {loading && contacts.length === 0 ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : total === 0 ? (
        <EmptyState
          message={
            hasFilter ? "לא נמצאו פניות התואמות לסינון." : "עדיין אין פניות."
          }
        />
      ) : (
        <div className="space-y-3" aria-busy={loading}>
          {contacts.map((c) => (
            <Card
              key={c.id}
              className={`space-y-3 ${c.handledAt ? "opacity-70" : ""}`}
            >
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
                    <span className="text-xs text-olive-700 bg-olive-50 border border-olive-300 rounded-full px-2 py-0.5">
                      צורפו קו״ח
                    </span>
                  )}
                  {c.handledAt && (
                    <span className="text-xs text-olive-700 bg-olive-100 border border-olive-300 rounded-full px-2 py-0.5">
                      ✓ טופל
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
                </>
              ) : (
                <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                  {c.message}
                </p>
              )}

              {/* פעולות הצוות — יצירת משרה (למעסיק), פתיחת קו"ח וסימון טיפול */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-sand-100">
                {c.inquiry_type === "employer" && (
                  <Link href={buildJobLink(c)}>
                    <Button size="sm" variant="outline">
                      צור משרה מפנייה זו ←
                    </Button>
                  </Link>
                )}
                {c.resumePath && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resumeBusyId === c.id}
                    onClick={() => openResume(c)}
                  >
                    {resumeBusyId === c.id ? "טוען…" : "פתח קו״ח"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={c.handledAt ? "ghost" : "secondary"}
                  disabled={busyId === c.id}
                  onClick={() => toggleHandled(c)}
                >
                  {busyId === c.id
                    ? "מעדכן…"
                    : c.handledAt
                      ? "סמן כלא טופל"
                      : "סמן כטופל ✓"}
                </Button>
              </div>
            </Card>
          ))}
          <AdminPager page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
