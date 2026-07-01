"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  listCommissions,
  getCommissionsSummary,
  updateCommissionStatus,
  updatePlacement,
  createReminder,
} from "@/lib/admin-api";
import type { CommissionStatus, Placement } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlacementTimeline } from "@/components/admin/PlacementTimeline";
import { StatCard } from "@/components/admin/StatCard";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button, Input, Select } from "@/components/ui";
import { AdminPager } from "@/components/admin/AdminPager";
import {
  COMMISSION_STATUS_LABELS,
  PLACEMENT_STATUS_LABELS,
} from "@/lib/labels";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import { effectiveCommissionStatus, isCollectibleNow } from "@/lib/commission";

export default function CommissionsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Placement[]>([]);
  const [summary, setSummary] = useState<{
    count: number;
    pendingTotal: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  // עריכת סכום עמלה inline — id הגיוס שנערך + הערך הנוכחי בשדה
  const [editing, setEditing] = useState<string | null>(null);
  const [amountDraft, setAmountDraft] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "" | "collectible" | "guarantee" | "paid"
  >("");
  const [page, setPage] = useState(1);
  const confirm = useConfirm();

  const reload = () =>
    Promise.all([listCommissions(), getCommissionsSummary()])
      .then(([list, sum]) => {
        setRows(list);
        setSummary(sum);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => setPage(1), [statusFilter]);

  const setStatus = async (id: string, status: CommissionStatus) => {
    // אישור על מעברים כספיים — פעולות בלתי-הפיכות שסוגרות גבייה.
    const confirmMsg =
      status === "paid"
        ? "לסמן את העמלה כשולמה? פעולה זו סוגרת את הגבייה ואינה הפיכה."
        : status === "invoiced"
          ? "לסמן שנשלחה חשבונית למעסיק על עמלה זו?"
          : "";
    if (
      confirmMsg &&
      !(await confirm({
        title: status === "paid" ? "סימון כשולם" : "סימון חשבונית",
        message: confirmMsg,
        confirmLabel: status === "paid" ? "סמן כשולם" : "סמן שנשלחה חשבונית",
      }))
    )
      return;
    setError("");
    setMsg("");
    try {
      await updateCommissionStatus(id, status);
      setMsg("סטטוס העמלה עודכן");
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEdit = (p: Placement) => {
    setError("");
    setMsg("");
    setEditing(p.id);
    setAmountDraft(p.commissionAmount ? String(p.commissionAmount) : "");
  };

  const saveAmount = async (id: string) => {
    setError("");
    setMsg("");
    const value = Number(amountDraft);
    if (!amountDraft || isNaN(value) || value <= 0) {
      setError("יש להזין סכום עמלה תקין (₪)");
      return;
    }
    setSavingAmount(true);
    try {
      await updatePlacement(id, { commissionAmount: value });
      setMsg("סכום העמלה עודכן");
      setEditing(null);
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingAmount(false);
    }
  };

  const createCollectionReminder = async (p: Placement) => {
    setError("");
    setMsg("");
    try {
      await createReminder({
        message: `גביית עמלה — ${p.employer?.companyName ?? "מעסיק"} / ${p.job?.title ?? "משרה"} (${p.commissionAmount ? formatCurrency(p.commissionAmount) : ""})`,
        remindAt: p.guaranteeEndsAt,
        createdBy: user?.fullName || user?.email || "צוות",
      });
      setMsg("נוצרה תזכורת גבייה");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) return <Loading />;

  // מדדים מחושבים מהשורות — ממלאים את שורת הסטטיסטיקה לצד "עמלות פתוחות".
  const collectibleRows = rows.filter((p) =>
    isCollectibleNow(p.status, p.commissionStatus, p.guaranteeEndsAt),
  );
  const collectibleTotal = collectibleRows.reduce(
    (s, p) => s + (p.commissionAmount ?? 0),
    0,
  );
  const paidRows = rows.filter(
    (p) =>
      effectiveCommissionStatus(
        p.status,
        p.commissionStatus,
        p.guaranteeEndsAt,
      ) === "paid",
  );
  const paidTotal = paidRows.reduce((s, p) => s + (p.commissionAmount ?? 0), 0);

  // קטגוריית שורה לסינון: לגבייה / בערבות / שולם.
  const rowCategory = (p: Placement): "collectible" | "guarantee" | "paid" => {
    if (
      effectiveCommissionStatus(
        p.status,
        p.commissionStatus,
        p.guaranteeEndsAt,
      ) === "paid"
    )
      return "paid";
    if (isCollectibleNow(p.status, p.commissionStatus, p.guaranteeEndsAt))
      return "collectible";
    return "guarantee";
  };
  const PAGE_SIZE = 15;
  const filteredRows = statusFilter
    ? rows.filter((p) => rowCategory(p) === statusFilter)
    : rows;
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="ניהול עמלות"
        subtitle="עמלה הופכת לגבייה רק לאחר 3 חודשי ערבות מוצלחים"
      />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="עמלות פתוחות"
            value={formatCurrency(summary.pendingTotal)}
            hint={`${summary.count} גיוסים`}
            tone="accent"
          />
          <StatCard
            label="לגבייה עכשיו"
            value={formatCurrency(collectibleTotal)}
            hint={`${collectibleRows.length} גיוסים`}
            tone={collectibleRows.length > 0 ? "warn" : "default"}
          />
          <StatCard
            label="שולם"
            value={formatCurrency(paidTotal)}
            hint={`${paidRows.length} גיוסים`}
          />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorNote message={error} />
        </div>
      )}
      {msg && (
        <div className="mb-4">
          <SuccessNote message={msg} />
        </div>
      )}

      {rows.length > 0 && (
        <Card className="mb-4 sm:max-w-xs">
          <Select
            label="סינון לפי מצב"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "" | "collectible" | "guarantee" | "paid",
              )
            }
          >
            <option value="">הכל</option>
            <option value="collectible">לגבייה עכשיו</option>
            <option value="guarantee">בתקופת ערבות</option>
            <option value="paid">שולם</option>
          </Select>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState message="אין עמלות לרישום עדיין" />
      ) : filteredRows.length === 0 ? (
        <EmptyState message="אין עמלות במצב שנבחר" />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-ink-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">
                  משרה / מעסיק
                </th>
                <th className="px-4 py-3 text-start font-semibold">סכום</th>
                <th className="px-4 py-3 text-start font-semibold">גיוס</th>
                <th className="px-4 py-3 text-start font-semibold">עמלה</th>
                <th className="px-4 py-3 text-start font-semibold">ערבות עד</th>
                <th className="px-4 py-3 text-start font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {pageRows.map((p) => {
                // הסטטוס האפקטיבי — מקדם not_due→due אם הערבות כבר עברה
                const status = effectiveCommissionStatus(
                  p.status,
                  p.commissionStatus,
                  p.guaranteeEndsAt,
                );
                const collectible = isCollectibleNow(
                  p.status,
                  p.commissionStatus,
                  p.guaranteeEndsAt,
                );
                const settled =
                  status === "paid" || status === "partial_refund";
                const days = daysUntil(p.guaranteeEndsAt);
                const approaching =
                  !settled && !collectible && days > 0 && days <= 7;
                const isOpen = expanded === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className="hover:bg-sand-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink-900">
                          {p.job?.title ?? "—"}
                        </p>
                        <p className="text-xs text-ink-400">
                          {p.employer?.companyName ?? "—"} · גויס{" "}
                          {formatDate(p.placedAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink-900 whitespace-nowrap">
                        {editing === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-28">
                              <Input
                                type="number"
                                min={0}
                                value={amountDraft}
                                onChange={(e) => setAmountDraft(e.target.value)}
                                placeholder="₪"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => saveAmount(p.id)}
                              disabled={savingAmount}
                            >
                              שמירה
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditing(null)}
                              disabled={savingAmount}
                            >
                              ביטול
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>
                              {p.commissionAmount
                                ? formatCurrency(p.commissionAmount)
                                : "—"}
                            </span>
                            {/* אין לערוך סכום לאחר שנשלחה חשבונית/שולם — שלמות נתונים */}
                            {status !== "paid" &&
                              status !== "invoiced" &&
                              status !== "partial_refund" && (
                                <button
                                  type="button"
                                  onClick={() => startEdit(p)}
                                  className="text-xs text-navy-600 hover:underline font-normal"
                                >
                                  עריכה
                                </button>
                              )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={p.status}
                          label={PLACEMENT_STATUS_LABELS[p.status]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={status}
                          label={COMMISSION_STATUS_LABELS[status]}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            collectible
                              ? "text-olive-700 font-bold"
                              : approaching
                                ? "text-amber-700 font-semibold"
                                : "text-ink-500"
                          }
                        >
                          {formatDate(p.guaranteeEndsAt)}
                        </span>
                        {collectible ? (
                          <span className="block text-xs text-olive-700">
                            ניתן לגבות
                          </span>
                        ) : settled ? null : (
                          <span
                            className={
                              "block text-xs " +
                              (approaching ? "text-amber-700" : "text-ink-400")
                            }
                          >
                            {approaching && "⏰ "}
                            עוד {days} {days === 1 ? "יום" : "ימים"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpanded(isOpen ? null : p.id)}
                          >
                            {isOpen ? "סגירת מסלול" : "מסלול הגיוס"}
                          </Button>
                          <Link href={`/admin/commissions/${p.id}/invoice`}>
                            <Button size="sm" variant="ghost">
                              חשבונית
                            </Button>
                          </Link>
                          {collectible && status === "due" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStatus(p.id, "invoiced")}
                            >
                              סמן שנשלחה חשבונית
                            </Button>
                          )}
                          {collectible && status === "invoiced" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setStatus(p.id, "paid")}
                            >
                              סמן כשולם
                            </Button>
                          )}
                          {collectible && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => createCollectionReminder(p)}
                            >
                              תזכורת גבייה
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-sand-50">
                        <td colSpan={6} className="px-4 py-4">
                          <PlacementTimeline p={p} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <AdminPager page={page} totalPages={totalPages} onPage={setPage} />
        </Card>
      )}

      <p className="text-xs text-ink-400 mt-4">
        חשוב: עמלה לעולם אינה נגבית ביום הגיוס — רק לאחר מעבר תקופת הערבות (3
        חודשים). הכפתורים מופיעים רק כשהעמלה אכן מגיעה.
      </p>
    </div>
  );
}
