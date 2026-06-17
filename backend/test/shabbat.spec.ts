import { describe, it, expect } from "vitest";
import {
  isShabbat,
  isShabbatOrHoliday,
  nextAllowedSendTime,
} from "../src/common/shabbat/shabbat";

// תאריכים קבועים (חורף — ינואר 2026). 9.1.2026 = שישי, 10.1.2026 = שבת.
describe("shabbat — אין שליחה בשבת", () => {
  it("שבת בצהריים → שבת", () => {
    expect(isShabbat(new Date("2026-01-10T10:00:00Z"))).toBe(true);
  });

  it("שישי אחרי כניסת שבת → שבת", () => {
    expect(isShabbat(new Date("2026-01-09T16:30:00Z"))).toBe(true);
  });

  it("שישי בבוקר → לא שבת", () => {
    expect(isShabbat(new Date("2026-01-09T06:00:00Z"))).toBe(false);
  });

  it("אמצע השבוע → לא שבת", () => {
    expect(isShabbat(new Date("2026-01-07T10:00:00Z"))).toBe(false);
  });

  it("isShabbatOrHoliday עקבי עם isShabbat", () => {
    const d = new Date("2026-01-10T10:00:00Z");
    expect(isShabbatOrHoliday(d)).toBe(isShabbat(d));
  });

  it("nextAllowedSendTime: ביום חול מחזיר את הזמן הנוכחי", () => {
    const weekday = new Date("2026-01-07T10:00:00Z");
    expect(nextAllowedSendTime(weekday).getTime()).toBe(weekday.getTime());
  });

  it("nextAllowedSendTime: בשבת מחזיר זמן עתידי", () => {
    const shabbat = new Date("2026-01-10T10:00:00Z");
    expect(nextAllowedSendTime(shabbat).getTime()).toBeGreaterThan(
      shabbat.getTime(),
    );
  });
});
