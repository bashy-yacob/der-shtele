"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard } from "@/lib/admin-api";
import type { DashboardSummary } from "@/types";
import {
  Coins,
  ChartLineUp,
  ChatCircleText,
  BellRinging,
  Briefcase,
  UserPlus,
  EnvelopeSimple,
  Plus,
  ArrowLeft,
  WarningCircle,
  CheckCircle,
  type Icon,
} from "@/lib/icons";
import { Loading, ErrorNote, EmptyState } from "@/components/admin/Feedback";
import { Card } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { FIELD_LABELS, regionLabel } from "@/lib/labels";
import { cn, formatCurrency, daysUntil } from "@/lib/utils";

/** תווית ותק המועמד הראשון בתור (התור ממוין לפי סדר הגעה — עולה). */
function waitedLabel(createdAt: string): string {
  const d = -daysUntil(createdAt);
  if (d <= 0) return "הוותיק נכנס היום";
  if (d === 1) return "הוותיק ממתין כבר יום";
  if (d === 2) return "הוותיק ממתין כבר יומיים";
  return `הוותיק ממתין כבר ${d} ימים`;
}

type ActionItem = {
  href: string;
  icon: Icon;
  label: string;
  danger?: boolean;
};

/** מדד-משנה בודד ברצועת "מבט מהיר". */
type Metric = {
  value: string | number;
  label: string;
  icon: Icon;
  wide?: boolean;
};

/** כותרת-אזור עדינה עם קו-הפרדה — מחדדת את הקיבוץ בין חלקי הלוח. */
function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-sm font-display font-semibold text-ink-700 shrink-0">
        {title}
      </h2>
      <span className="h-px flex-1 bg-sand-200" aria-hidden />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!data) return <EmptyState message="אין נתונים להצגה" />;

  const { stats, queue, activeJobs } = data;
  const firstName = user?.fullName?.trim().split(" ")[0] ?? "";
  const hasQueue = stats.queueCount > 0;

  // "דורש טיפול עכשיו" — רק פריטים עם ספירת אמת (>0), לפי סדר דחיפות.
  const actions: ActionItem[] = (
    [
      stats.overdueReminders > 0 && {
        href: "/admin/reminders",
        icon: BellRinging,
        danger: true,
        label:
          stats.overdueReminders === 1
            ? "תזכורת אחת עברה את זמנה"
            : `${stats.overdueReminders} תזכורות עברו זמנן`,
      },
      stats.pendingJobs > 0 && {
        href: "/admin/jobs",
        icon: Briefcase,
        label:
          stats.pendingJobs === 1
            ? "משרה אחת ממתינה לאישור"
            : `${stats.pendingJobs} משרות ממתינות לאישור`,
      },
      stats.commissionsDueCount > 0 && {
        href: "/admin/commissions",
        icon: Coins,
        label:
          stats.commissionsDueCount === 1
            ? "עמלה אחת בשלה לחיוב"
            : `${stats.commissionsDueCount} עמלות בשלות לחיוב`,
      },
      stats.newContactsCount > 0 && {
        href: "/admin/contacts",
        icon: ChatCircleText,
        label:
          stats.newContactsCount === 1
            ? "פנייה חדשה אחת"
            : `${stats.newContactsCount} פניות חדשות`,
      },
    ] as (ActionItem | false)[]
  ).filter(Boolean) as ActionItem[];

  // מדדי-משנה — רצועת "מבט מהיר" (לא דורש פעולה מיידית, רק תמונת מצב)
  const metrics: Metric[] = [
    {
      value: stats.placementsThisMonth,
      label: "גיוסים החודש",
      icon: ChartLineUp,
    },
    {
      value: formatCurrency(stats.pendingCommissions),
      label: "עמלות פתוחות",
      icon: Coins,
    },
    { value: stats.newCandidatesThisWeek, label: "קו״ח השבוע", icon: UserPlus },
    { value: stats.activeJobs, label: "משרות פעילות", icon: Briefcase },
    {
      value: stats.activeSubscribers,
      label: "מנויי מייל",
      icon: EnvelopeSimple,
      wide: true,
    },
  ];

  return (
    <div>
      {/* כותרת + פעולה ראשית */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          {firstName && (
            <p className="text-sm text-ink-500">שלום, {firstName}</p>
          )}
          <h1 className="text-2xl font-display text-ink-900">לוח בקרה</h1>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-1.5 bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" weight="bold" /> משרה חדשה
        </Link>
      </div>

      {/* אזור 1 — דורש טיפול: כרטיס-על מאוחד (המדד הקריטי + מה שדורש טיפול עכשיו) */}
      <div className="bg-white rounded-2xl border border-sand-200 shadow-soft p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl md:text-7xl font-display font-bold text-navy-700 leading-none shrink-0">
              {stats.queueCount}
            </span>
            <div className="min-w-0">
              {hasQueue ? (
                <span className="inline-flex items-center gap-1.5 text-olive-700 bg-olive-50 border border-olive-300 rounded-full px-2.5 py-0.5 text-xs font-bold mb-1.5">
                  <WarningCircle className="w-3.5 h-3.5" weight="fill" /> דורש
                  טיפול
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-ink-500 bg-sand-100 border border-sand-200 rounded-full px-2.5 py-0.5 text-xs font-bold mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" /> אין
                  ממתינים
                </span>
              )}
              <p className="text-sm md:text-base text-ink-500 leading-tight">
                מועמדים בתור טיפול
              </p>
              {hasQueue && queue[0] && (
                <p className="text-xs text-ink-400 mt-0.5">
                  {waitedLabel(queue[0].createdAt)}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/admin/candidates"
            className="w-full md:w-auto justify-center inline-flex items-center gap-1.5 bg-olive-500 hover:bg-olive-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            {hasQueue ? "התחל לטפל" : "לכל המועמדים"}
            <ArrowLeft className="w-4 h-4" weight="bold" />
          </Link>
        </div>

        {/* דורש טיפול עכשיו */}
        <div className="mt-5 pt-4 border-t border-sand-200">
          <div className="flex items-center gap-1.5 mb-2.5">
            <WarningCircle
              className={cn(
                "w-4 h-4",
                actions.length > 0 ? "text-olive-600" : "text-ink-400",
              )}
              weight="fill"
            />
            <p className="text-xs font-bold text-ink-700 tracking-wide">
              דורש טיפול עכשיו
            </p>
          </div>
          {actions.length === 0 ? (
            <p className="text-sm text-ink-400 inline-flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-olive-500" weight="fill" />
              אין משימות דחופות כרגע — הכול תחת שליטה.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
              {actions.map((a) => {
                const AIcon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={cn(
                      "flex md:inline-flex items-center justify-between md:justify-start gap-1.5 text-xs font-semibold px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-full border transition-colors",
                      a.danger
                        ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                        : "bg-white border-olive-300 text-ink-900 hover:bg-olive-50",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <AIcon
                        className={cn(
                          "w-4 h-4",
                          a.danger ? "" : "text-olive-600",
                        )}
                      />
                      {a.label}
                    </span>
                    <ArrowLeft className="w-4 h-4 opacity-60 md:hidden" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* אזור 2 — מבט מהיר: מדדי-משנה (תמונת מצב, לא דורש פעולה) */}
      <section className="mb-6 md:mb-8">
        <SectionLabel title="מבט מהיר" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 md:gap-3">
          {metrics.map((m) => {
            const MIcon = m.icon;
            return (
              <div
                key={m.label}
                className={cn(
                  "bg-white rounded-xl border border-sand-200 shadow-soft px-3.5 py-3",
                  m.wide && "col-span-2 md:col-span-1",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xl md:text-2xl font-display font-bold text-ink-900 leading-none">
                    {m.value}
                  </div>
                  <MIcon className="w-4 h-4 text-ink-400 shrink-0" />
                </div>
                <div className="text-[11px] text-ink-500 mt-1.5">{m.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* אזור 3 — רשימות עבודה */}
      <section>
        <SectionLabel title="רשימות עבודה" />
        <div className="grid lg:grid-cols-2 gap-4">
          {/* תור טיפול */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-display font-semibold text-ink-900">
                תור טיפול
              </h2>
              <Link
                href="/admin/candidates"
                className="text-xs text-navy-600 font-semibold hover:underline"
              >
                לכל המועמדים ←
              </Link>
            </div>
            {queue.length === 0 ? (
              <EmptyState message="אין מועמדים חדשים הממתינים לטיפול 🎉" />
            ) : (
              <ul className="divide-y divide-sand-100">
                {queue.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/candidates/${c.id}`}
                      className="flex items-center justify-between gap-2 py-2 -mx-2 px-2 rounded-lg hover:bg-sand-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">
                          {c.fullName}
                        </p>
                        <p className="text-[11px] text-ink-500 truncate">
                          {FIELD_LABELS[c.field]} · {regionLabel(c.region)}
                          {c.job ? ` · ${c.job.title}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-navy-600 shrink-0 whitespace-nowrap">
                        טפל ←
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* משרות פעילות */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-display font-semibold text-ink-900">
                משרות פעילות
              </h2>
              <Link
                href="/admin/jobs"
                className="text-xs text-navy-600 font-semibold hover:underline"
              >
                לכל המשרות ←
              </Link>
            </div>
            {activeJobs.length === 0 ? (
              <EmptyState message="אין משרות פעילות" />
            ) : (
              <ul className="divide-y divide-sand-100">
                {activeJobs.map((j) => (
                  <li key={j.id}>
                    <Link
                      href={`/admin/jobs/${j.id}`}
                      className="flex items-center justify-between gap-2 py-2 -mx-2 px-2 rounded-lg hover:bg-sand-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">
                          {j.title}
                        </p>
                        <p className="text-[11px] text-ink-500 truncate">
                          {FIELD_LABELS[j.field]} · {regionLabel(j.region)}
                        </p>
                      </div>
                      <span className="text-[11px] text-ink-400 shrink-0 whitespace-nowrap">
                        {j.presentedCount} הוצגו
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
