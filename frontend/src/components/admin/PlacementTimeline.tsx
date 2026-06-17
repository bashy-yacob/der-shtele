// PlacementTimeline — לוג הפעולות של גיוס: היסטוריה אמיתית (events) + ספירה
// לאחור לגבייה. נועד שהצוות יראה את כל השרשרת — בלי שעמלה "תקפוץ" פתאום.
"use client";

import type { Placement, PlacementEvent, PlacementEventType } from "@/types";
import { PLACEMENT_EVENT_LABELS } from "@/lib/labels";
import { formatDateTime, formatDate, daysUntil } from "@/lib/utils";

type TimelinePlacement = Pick<
  Placement,
  "placedAt" | "guaranteeEndsAt" | "status" | "commissionStatus"
> & { events?: PlacementEvent[] };

// גוון הנקודה לפי סוג הפעולה
const EVENT_TONE: Record<PlacementEventType, string> = {
  created: "bg-navy-500",
  confirmed: "bg-navy-500",
  guarantee: "bg-sand-400",
  completed: "bg-olive-500",
  cancelled: "bg-red-500",
  commission_invoiced: "bg-navy-500",
  commission_paid: "bg-olive-500",
  commission_refunded: "bg-red-500",
  amount_updated: "bg-sand-400",
};

export function PlacementTimeline({ p }: { p: TimelinePlacement }) {
  const events = p.events ?? [];
  const settled =
    p.commissionStatus === "paid" || p.commissionStatus === "partial_refund";
  const cancelled = p.status === "cancelled";
  const days = daysUntil(p.guaranteeEndsAt);
  const guaranteeOver = days <= 0;

  // ספירה לאחור — רק כשהעמלה עוד רלוונטית (לא שולמה ולא בוטלה)
  const showCountdown = !settled && !cancelled;
  const approaching = showCountdown && !guaranteeOver && days <= 7;

  return (
    <div className="space-y-3">
      {showCountdown && (
        <div
          className={
            "rounded-lg px-3 py-2 text-sm border " +
            (guaranteeOver
              ? "bg-olive-50 border-olive-300 text-olive-700"
              : approaching
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-sand-50 border-sand-200 text-ink-600")
          }
        >
          {guaranteeOver ? (
            <span className="font-semibold">
              ✓ ניתן לגבות עמלה — תקופת הערבות הסתיימה (
              {formatDate(p.guaranteeEndsAt)})
            </span>
          ) : (
            <span>
              {approaching && <span className="font-bold">⏰ </span>}
              עוד <span className="font-bold">{days}</span>{" "}
              {days === 1 ? "יום" : "ימים"} עד שניתן לגבות עמלה
              <span className="text-ink-400">
                {" "}
                · סיום ערבות {formatDate(p.guaranteeEndsAt)}
              </span>
            </span>
          )}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-ink-400">אין עדיין פעולות מתועדות לגיוס זה.</p>
      ) : (
        <ol className="relative space-y-3 pr-1">
          {events.map((e, i) => (
            <li key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={
                    "mt-1 h-2.5 w-2.5 rounded-full shrink-0 " +
                    (EVENT_TONE[e.type] ?? "bg-sand-400")
                  }
                />
                {i < events.length - 1 && (
                  <span className="w-px flex-1 bg-sand-200 my-0.5" />
                )}
              </div>
              <div className="pb-1 -mt-0.5">
                <p className="text-sm font-semibold text-ink-900">
                  {PLACEMENT_EVENT_LABELS[e.type] ?? e.type}
                </p>
                {e.note && (
                  <p className="text-xs text-ink-600">{e.note}</p>
                )}
                <p className="text-xs text-ink-400">
                  {formatDateTime(e.createdAt)}
                  {e.createdBy && <span> · {e.createdBy}</span>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
