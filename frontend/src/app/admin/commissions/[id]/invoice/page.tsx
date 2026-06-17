"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlacement } from "@/lib/admin-api";
import type { Placement } from "@/types";
import { Loading, ErrorNote, EmptyState } from "@/components/admin/Feedback";
import { Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { COMMISSION_STATUS_LABELS } from "@/lib/labels";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Placement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlacement(id)
      .then(setP)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!p) return <EmptyState message="גיוס לא נמצא" />;

  const amount = p.commissionAmount ?? 0;
  const vat = Math.round(amount * 0.17);
  const total = amount + vat;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/admin/commissions"
          className="text-sm text-navy-600 hover:underline"
        >
          → חזרה לעמלות
        </Link>
        <Button onClick={() => window.print()}>הדפסה / שמירה כ-PDF</Button>
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 shadow-soft p-8 max-w-2xl mx-auto">
        <div className="flex items-start justify-between border-b border-sand-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-display text-ink-900">דער שטעלע</h1>
            <p className="text-sm text-ink-500">סוכנות השמה דיגיטלית</p>
          </div>
          <div className="text-start">
            <p className="text-lg font-bold text-ink-900">חשבון עמלה</p>
            <p className="text-xs text-ink-400">מס׳ {p.id.slice(-8)}</p>
            <p className="text-xs text-ink-400">{formatDate(new Date())}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-ink-500 mb-1">לכבוד:</p>
          <p className="font-semibold text-ink-900">
            {p.employer?.companyName ?? "מעסיק"}
          </p>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-sand-200 text-ink-500">
              <th className="text-start py-2 font-semibold">תיאור</th>
              <th className="text-start py-2 font-semibold">סכום</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-sand-100">
              <td className="py-3 text-ink-900">
                עמלת השמה — {p.job?.title ?? "משרה"}
                {p.candidate?.fullName ? ` (${p.candidate.fullName})` : ""}
                <br />
                <span className="text-xs text-ink-400">
                  גיוס מתאריך {formatDate(p.placedAt)} · לאחר תקופת ערבות של 3
                  חודשים
                </span>
              </td>
              <td className="py-3 text-ink-900">{formatCurrency(amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="text-ink-500">
              <td className="py-2 text-start">מע״מ (17%)</td>
              <td className="py-2">{formatCurrency(vat)}</td>
            </tr>
            <tr className="font-bold text-ink-900 border-t border-sand-200">
              <td className="py-2 text-start">סה״כ לתשלום</td>
              <td className="py-2">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="flex items-center justify-between text-sm border-t border-sand-200 pt-4">
          <span className="text-ink-500">
            סטטוס: {COMMISSION_STATUS_LABELS[p.commissionStatus]}
          </span>
          <span className="text-ink-400 text-xs">
            תשלום: העברה בנקאית / כרטיס אשראי
          </span>
        </div>

        <p className="text-xs text-ink-400 mt-6 text-center">
          מסמך זה הופק מהדשבורד הפנימי. אינו מהווה חשבונית מס רשמית — יש להפיק
          חשבונית מס דרך מערכת הנהלת החשבונות.
        </p>
      </div>
    </div>
  );
}
