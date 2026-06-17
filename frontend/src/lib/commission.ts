// commission — מראה של לוגיקת העמלות בצד שרת (backend/common/commission).
// לתצוגה בלבד; ה-backend הוא מקור האמת.
import type { CommissionStatus, PlacementStatus } from "@/types";

const EARNED: PlacementStatus[] = ["confirmed", "guarantee", "completed"];
const SETTLED: CommissionStatus[] = ["paid", "partial_refund"];

/** האם העמלה אמורה להיגבות (הגיוס אושר וטרם שולמה)? */
export function isCommissionDue(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
): boolean {
  return (
    EARNED.includes(placementStatus) && !SETTLED.includes(commissionStatus)
  );
}

/** האם תקופת הערבות (3 חודשים ≈ 90 יום) הסתיימה? אז ניתן לגבות בפועל. */
export function isGuaranteeOver(guaranteeEndsAt: string | Date): boolean {
  return new Date() >= new Date(guaranteeEndsAt);
}

/** עמלה שניתן לגבות עכשיו: מגיעה + עברה תקופת הערבות. */
export function isCollectibleNow(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
  guaranteeEndsAt: string | Date,
): boolean {
  return (
    isCommissionDue(placementStatus, commissionStatus) &&
    isGuaranteeOver(guaranteeEndsAt)
  );
}
