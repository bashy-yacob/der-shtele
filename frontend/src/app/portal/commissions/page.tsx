"use client";

// עמלות וחשבוניות של המעסיק (קריאה בלבד). מציג סטטוס אפקטיבי + מועד תום ערבות.
import { useEffect, useState } from "react";
import { listPortalPlacements, type PortalPlacement } from "@/lib/portal-api";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { COMMISSION_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import { effectiveCommissionStatus } from "@/lib/commission";

export default function PortalCommissionsPage() {
  const [rows, setRows] = useState<PortalPlacement[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listPortalPlacements()
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl text-ink-900">עמלות וחשבוניות</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!rows ? (
        <p className="text-ink-500">טוען...</p>
      ) : rows.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-ink-500">אין עדיין גיוסים או עמלות לרישום.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-ink-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">משרה</th>
                <th className="px-4 py-3 text-start font-semibold">גויס</th>
                <th className="px-4 py-3 text-start font-semibold">ערבות עד</th>
                <th className="px-4 py-3 text-start font-semibold">עמלה</th>
                <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {rows.map((p) => {
                const status = effectiveCommissionStatus(
                  p.status,
                  p.commissionStatus,
                  p.guaranteeEndsAt,
                );
                return (
                  <tr key={p.id} className="hover:bg-sand-50">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {p.job?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {formatDate(p.placedAt)}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {formatDate(p.guaranteeEndsAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900">
                      {p.commissionAmount
                        ? formatCurrency(p.commissionAmount)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={status}
                        label={COMMISSION_STATUS_LABELS[status]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-ink-400 leading-relaxed">
        עמלה נגבית רק לאחר תקופת ערבות מוצלחת של 3 חודשים מיום הגיוס. עד אז
        הסטטוס הוא &quot;בתקופת ערבות&quot;.
      </p>
    </div>
  );
}
