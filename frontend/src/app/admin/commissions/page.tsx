"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listCommissions,
  getCommissionsSummary,
  updateCommissionStatus,
  createReminder,
} from "@/lib/admin-api";
import type { CommissionStatus, Placement } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import {
  Loading,
  ErrorNote,
  SuccessNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Button } from "@/components/ui";
import {
  COMMISSION_STATUS_LABELS,
  PLACEMENT_STATUS_LABELS,
} from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isCommissionDue, isCollectibleNow } from "@/lib/commission";

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

  const setStatus = async (id: string, status: CommissionStatus) => {
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

      {rows.length === 0 ? (
        <EmptyState message="אין עמלות לרישום עדיין" />
      ) : (
        <Card className="p-0 overflow-hidden">
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
              {rows.map((p) => {
                const due = isCommissionDue(p.status, p.commissionStatus);
                const collectible = isCollectibleNow(
                  p.status,
                  p.commissionStatus,
                  p.guaranteeEndsAt,
                );
                return (
                  <tr key={p.id} className="hover:bg-sand-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-900">
                        {p.job?.title ?? "—"}
                      </p>
                      <p className="text-xs text-ink-400">
                        {p.employer?.companyName ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900 whitespace-nowrap">
                      {p.commissionAmount
                        ? formatCurrency(p.commissionAmount)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={p.status}
                        label={PLACEMENT_STATUS_LABELS[p.status]}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={p.commissionStatus}
                        label={COMMISSION_STATUS_LABELS[p.commissionStatus]}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={
                          collectible
                            ? "text-olive-700 font-bold"
                            : "text-ink-400"
                        }
                      >
                        {formatDate(p.guaranteeEndsAt)}
                      </span>
                      {collectible && (
                        <span className="block text-xs text-olive-700">
                          ניתן לגבות
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/commissions/${p.id}/invoice`}>
                          <Button size="sm" variant="ghost">
                            חשבונית
                          </Button>
                        </Link>
                        {due && p.commissionStatus === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatus(p.id, "invoiced")}
                          >
                            סמן כחויב
                          </Button>
                        )}
                        {due && (
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
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-ink-400 mt-4">
        חשוב: עמלה לעולם אינה נגבית ביום הגיוס — רק לאחר מעבר תקופת הערבות (3
        חודשים). הכפתורים מופיעים רק כשהעמלה אכן מגיעה.
      </p>
    </div>
  );
}
