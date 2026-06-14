// commission — לוגיקת עמלות + ערבות 3 חודשים.
// מועמד שעזב בתוך תקופת הערבות → החזר חלקי למעסיק.

import { CommissionStatus, PlacementStatus } from '@prisma/client';

/** תקופת הערבות בחודשים */
export const GUARANTEE_MONTHS = 3;

/** מחזיר את תאריך סיום הערבות: placedAt + 3 חודשים */
export function calcGuaranteeEnd(placedAt: Date): Date {
  const d = new Date(placedAt);
  d.setMonth(d.getMonth() + GUARANTEE_MONTHS);
  return d;
}

/** האם תקופת הערבות הסתיימה נכון לתאריך נתון? */
export function isGuaranteeOver(
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): boolean {
  return now >= guaranteeEndsAt;
}

/**
 * האם העמלה אמורה להיגבות?
 * עמלה מגיעה ברגע שהגיוס אושר (confirmed ומעלה), אך טרם שולמה.
 */
export function isCommissionDue(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
): boolean {
  const earned: PlacementStatus[] = ['confirmed', 'guarantee', 'completed'];
  const settled: CommissionStatus[] = ['paid', 'partial_refund'];
  return (
    earned.includes(placementStatus) && !settled.includes(commissionStatus)
  );
}

/**
 * גוזר את סטטוס העמלה הצפוי לפי מצב הגיוס.
 * - גיוס בוטל בתוך ערבות → partial_refund
 * - גיוס פעיל וטרם שולם → pending
 */
export function deriveCommissionStatus(
  placementStatus: PlacementStatus,
  current: CommissionStatus,
  guaranteeEndsAt: Date,
  now: Date = new Date(),
): CommissionStatus {
  if (placementStatus === 'cancelled' && !isGuaranteeOver(guaranteeEndsAt, now)) {
    return 'partial_refund';
  }
  return current;
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
