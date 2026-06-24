import { describe, it, expect } from "vitest";
import {
  GUARANTEE_MONTHS,
  calcGuaranteeEnd,
  isGuaranteeOver,
  isCommissionDue,
  effectiveCommissionStatus,
  deriveCommissionStatus,
  calcPartialRefund,
} from "../src/common/commission/commission";
import {
  assertCommissionTransition,
  canTransitionCommission,
} from "../src/common/status-machine/status-machine";

describe("commission — ערבות 3 חודשים", () => {
  it("תקופת הערבות היא 3 חודשים", () => {
    expect(GUARANTEE_MONTHS).toBe(3);
  });

  it("calcGuaranteeEnd מוסיף 3 חודשים לתאריך הגיוס", () => {
    const placed = new Date("2026-01-15T00:00:00Z");
    expect(calcGuaranteeEnd(placed).getMonth()).toBe(
      new Date("2026-04-15T00:00:00Z").getMonth(),
    );
  });

  it("isGuaranteeOver — לפני/אחרי סיום הערבות", () => {
    const end = new Date("2026-04-15T00:00:00Z");
    expect(isGuaranteeOver(end, new Date("2026-03-01T00:00:00Z"))).toBe(false);
    expect(isGuaranteeOver(end, new Date("2026-05-01T00:00:00Z"))).toBe(true);
  });
});

describe("effectiveCommissionStatus — קידום not_due→due בתום ערבות", () => {
  const guaranteeEnd = new Date("2026-04-15T00:00:00Z");
  const inGuarantee = new Date("2026-02-01T00:00:00Z");
  const afterGuarantee = new Date("2026-05-01T00:00:00Z");

  it("גיוס תקף + הערבות הסתיימה → מקדם ל-due", () => {
    expect(
      effectiveCommissionStatus("confirmed", "not_due", guaranteeEnd, afterGuarantee),
    ).toBe("due");
  });

  it("הערבות עוד לא הסתיימה → נשאר not_due (לא גובים ביום הגיוס)", () => {
    expect(
      effectiveCommissionStatus("confirmed", "not_due", guaranteeEnd, inGuarantee),
    ).toBe("not_due");
  });

  it("סטטוס סופי (paid) → לא משתנה", () => {
    expect(
      effectiveCommissionStatus("completed", "paid", guaranteeEnd, afterGuarantee),
    ).toBe("paid");
  });
});

describe("isCommissionDue — עמלה ניתנת לגבייה רק אחרי הערבות", () => {
  const guaranteeEnd = new Date("2026-04-15T00:00:00Z");
  const inGuarantee = new Date("2026-02-01T00:00:00Z");
  const afterGuarantee = new Date("2026-05-01T00:00:00Z");

  it("חוק ברזל: ביום הגיוס (בתוך ערבות) — לא מגיעה", () => {
    expect(
      isCommissionDue("confirmed", "not_due", guaranteeEnd, inGuarantee),
    ).toBe(false);
  });

  it("לאחר תום הערבות — מגיעה", () => {
    expect(
      isCommissionDue("confirmed", "not_due", guaranteeEnd, afterGuarantee),
    ).toBe(true);
    expect(
      isCommissionDue("completed", "invoiced", guaranteeEnd, afterGuarantee),
    ).toBe(true);
  });

  it("עמלה ששולמה או הוחזרה — לא מגיעה שוב", () => {
    expect(
      isCommissionDue("completed", "paid", guaranteeEnd, afterGuarantee),
    ).toBe(false);
    expect(
      isCommissionDue("guarantee", "partial_refund", guaranteeEnd, afterGuarantee),
    ).toBe(false);
  });

  it("גיוס שבוטל — לא מגיעה", () => {
    expect(
      isCommissionDue("cancelled", "not_due", guaranteeEnd, afterGuarantee),
    ).toBe(false);
  });
});

describe("deriveCommissionStatus — גזירת סטטוס לפי מצב הגיוס", () => {
  const guaranteeEnd = new Date("2026-04-15T00:00:00Z");

  it("ביטול בתוך תקופת הערבות → החזר חלקי", () => {
    const now = new Date("2026-02-01T00:00:00Z"); // בתוך הערבות
    expect(
      deriveCommissionStatus("cancelled", "not_due", guaranteeEnd, now),
    ).toBe("partial_refund");
  });

  it("ביטול לאחר תום הערבות → לא משתנה", () => {
    const now = new Date("2026-05-01T00:00:00Z"); // אחרי הערבות
    expect(deriveCommissionStatus("cancelled", "paid", guaranteeEnd, now)).toBe(
      "paid",
    );
  });

  it("גיוס פעיל בתוך הערבות → נשאר not_due", () => {
    const now = new Date("2026-02-01T00:00:00Z");
    expect(
      deriveCommissionStatus("guarantee", "not_due", guaranteeEnd, now),
    ).toBe("not_due");
  });

  it("גיוס שהושלם לאחר הערבות → מקדם ל-due", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    expect(
      deriveCommissionStatus("completed", "not_due", guaranteeEnd, now),
    ).toBe("due");
  });
});

describe("assertCommissionTransition — חוק ברזל על מעברי עמלה", () => {
  it("מסלול תקין: not_due → due → invoiced → paid", () => {
    expect(canTransitionCommission("not_due", "due")).toBe(true);
    expect(canTransitionCommission("due", "invoiced")).toBe(true);
    expect(canTransitionCommission("invoiced", "paid")).toBe(true);
    expect(canTransitionCommission("due", "paid")).toBe(true);
  });

  it("אסור לדלג מ-not_due ישר ל-paid/invoiced", () => {
    expect(() => assertCommissionTransition("not_due", "paid")).toThrow();
    expect(() => assertCommissionTransition("not_due", "invoiced")).toThrow();
  });

  it("סטטוס סופי (paid) — אין ממנו מעבר", () => {
    expect(() => assertCommissionTransition("paid", "due")).toThrow();
    expect(canTransitionCommission("partial_refund", "paid")).toBe(false);
  });

  it("מעבר לאותו סטטוס — מותר (idempotent)", () => {
    expect(canTransitionCommission("due", "due")).toBe(true);
  });
});

describe("calcPartialRefund — החזר יחסי לזמן שנותר", () => {
  it("עזיבה במחצית תקופת הערבות → כמחצית החזר", () => {
    const placed = new Date("2026-01-01T00:00:00Z");
    const end = calcGuaranteeEnd(placed);
    const mid = new Date((placed.getTime() + end.getTime()) / 2);
    const refund = calcPartialRefund(9000, placed, mid);
    expect(refund).toBeGreaterThan(4000);
    expect(refund).toBeLessThan(5000);
  });

  it("עזיבה לאחר תום הערבות → אין החזר", () => {
    const placed = new Date("2026-01-01T00:00:00Z");
    const after = new Date("2026-06-01T00:00:00Z");
    expect(calcPartialRefund(9000, placed, after)).toBe(0);
  });
});
