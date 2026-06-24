// commission — לוגיקת עמלות + ערבות 3 חודשים (איפיון 7.4 · חוק ברזל).
//
// סטטוס העמלה: not_due → due → invoiced → paid (+ partial_refund לביטול בערבות).
// העמלה הופכת ל-due **רק** לאחר שתקופת הערבות (3 חודשים) הסתיימה — לעולם לא
// ביום הגיוס. ה-DB הוא מקור האמת; effectiveCommissionStatus מקדם not_due→due
// גם בלי שהקרון היומי רץ, כדי שתצוגה/בדיקה ישקפו תמיד את המציאות.

import { CommissionStatus, PlacementStatus } from '@prisma/client';

/** תקופת הערבות בחודשים */
export const GUARANTEE_MONTHS = 3;

/** סטטוסי גיוס שבהם הגיוס "נחשב" — העמלה נצברת (אך עדיין לא בהכרח לגבייה). */
const EARNED: PlacementStatus[] = ['confirmed', 'guarantee', 'completed'];

/** סטטוסי עמלה סופיים — הכסף הוסדר, לא נפתח מחדש. */
const SETTLED: CommissionStatus[] = ['paid', 'partial_refund'];

/**
 * תאריך סיום הערבות: placedAt + 3 חודשים, עם clamp לסוף החודש כדי למנוע גלישה
 * (למשל 30/11 + 3 → 28/02 ולא 02/03).
 */
export function calcGuaranteeEnd(placedAt: Date): Date {
  return addMonthsClamped(placedAt, GUARANTEE_MONTHS);
}

function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1); // למנוע גלישה כשהחודש היעד קצר יותר
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/** האם תקופת הערבות הסתיימה נכון לתאריך נתון? */
export function isGuaranteeOver(
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): boolean {
  return now >= guaranteeEndsAt;
}

/**
 * הסטטוס האפקטיבי של העמלה: מקדם not_due → due ברגע שהערבות הסתיימה והגיוס
 * עדיין תקף. לא נוגע בסטטוסים סופיים או בחשבונית שכבר יצאה.
 */
export function effectiveCommissionStatus(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): CommissionStatus {
  if (
    commissionStatus === 'not_due' &&
    EARNED.includes(placementStatus) &&
    isGuaranteeOver(guaranteeEndsAt, now)
  ) {
    return 'due';
  }
  return commissionStatus;
}

/**
 * האם העמלה ניתנת לגבייה עכשיו? — כלומר הערבות הסתיימה והכסף עדיין חייב
 * (due או invoiced). לעולם לא מחזיר true ביום הגיוס.
 */
export function isCommissionDue(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): boolean {
  const eff = effectiveCommissionStatus(
    placementStatus,
    commissionStatus,
    guaranteeEndsAt,
    now,
  );
  return eff === 'due' || eff === 'invoiced';
}

/**
 * גוזר את סטטוס העמלה הצפוי לפי מצב הגיוס, בעת מעבר סטטוס גיוס.
 * - סטטוס עמלה סופי (paid/partial_refund) → לא משתנה.
 * - גיוס בוטל בתוך תקופת הערבות → partial_refund.
 * - אחרת → הסטטוס האפקטיבי (כולל קידום not_due→due אם הערבות הסתיימה).
 */
export function deriveCommissionStatus(
  placementStatus: PlacementStatus,
  current: CommissionStatus,
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): CommissionStatus {
  if (SETTLED.includes(current)) return current;
  if (
    placementStatus === 'cancelled' &&
    !isGuaranteeOver(guaranteeEndsAt, now)
  ) {
    return 'partial_refund';
  }
  return effectiveCommissionStatus(
    placementStatus,
    current,
    guaranteeEndsAt,
    now,
  );
}

/** מספר חשבונית דטרמיניסטי לגיוס — יציב לאורך זמן וזהה בבק ובפרונט. */
export function buildInvoiceNumber(placementId: string): string {
  return `INV-${placementId.slice(-8).toUpperCase()}`;
}

/**
 * סכום ההחזר החלקי — יחסי לזמן שנותר בערבות.
 * דוגמה: עזב אחרי חודש מתוך 3 → החזר של 2/3.
 */
export function calcPartialRefund(
  commissionAmount: number,
  placedAt: Date,
  leftAt: Date,
): number {
  const guaranteeEnd = calcGuaranteeEnd(placedAt);
  const totalMs = guaranteeEnd.getTime() - placedAt.getTime();
  const remainingMs = Math.max(0, guaranteeEnd.getTime() - leftAt.getTime());
  const ratio = totalMs > 0 ? remainingMs / totalMs : 0;
  return Math.round(commissionAmount * ratio);
}
