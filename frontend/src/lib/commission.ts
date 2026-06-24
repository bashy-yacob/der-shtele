// commission — מראה של לוגיקת העמלות בצד שרת (backend/common/commission).
// לתצוגה בלבד; ה-backend הוא מקור האמת.
import type { CommissionStatus, PlacementStatus } from "@/types";

const EARNED: PlacementStatus[] = ["confirmed", "guarantee", "completed"];

/** האם תקופת הערבות (3 חודשים ≈ 90 יום) הסתיימה? אז ניתן לגבות בפועל. */
export function isGuaranteeOver(guaranteeEndsAt: string | Date): boolean {
  return new Date() >= new Date(guaranteeEndsAt);
}

/**
 * הסטטוס האפקטיבי: מקדם not_due → due כשהערבות הסתיימה והגיוס תקף — גם אם
 * הקרון היומי בצד שרת טרם רץ. מקביל ל-effectiveCommissionStatus בבק.
 */
export function effectiveCommissionStatus(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
  guaranteeEndsAt: string | Date,
): CommissionStatus {
  if (
    commissionStatus === "not_due" &&
    EARNED.includes(placementStatus) &&
    isGuaranteeOver(guaranteeEndsAt)
  ) {
    return "due";
  }
  return commissionStatus;
}

/** מספר חשבונית דטרמיניסטי לגיוס — מקביל ל-buildInvoiceNumber בבק. */
export function buildInvoiceNumber(placementId: string): string {
  return `INV-${placementId.slice(-8).toUpperCase()}`;
}

/** עמלה שניתן לגבות עכשיו: הערבות הסתיימה והכסף עדיין חייב (due/invoiced). */
export function isCollectibleNow(
  placementStatus: PlacementStatus,
  commissionStatus: CommissionStatus,
  guaranteeEndsAt: string | Date,
): boolean {
  const eff = effectiveCommissionStatus(
    placementStatus,
    commissionStatus,
    guaranteeEndsAt,
  );
  return eff === "due" || eff === "invoiced";
}
