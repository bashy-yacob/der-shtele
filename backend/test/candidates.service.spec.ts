import { describe, it, expect, vi } from "vitest";
import { CandidatesService } from "../src/modules/candidates/candidates.service";

// מוכיח שפעולות בכרטיס המועמד אכן נכתבות ל-DB (prisma), לא רק ל-state בדפדפן.
// ה-PATCH מהדשבורד → controller.update → service.update → prisma.candidate.update.

function makeService(currentStatus = "new") {
  const prisma = {
    candidate: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: "cand1", status: currentStatus }),
      update: vi.fn().mockResolvedValue({ id: "cand1", status: "in_progress" }),
    },
    callLog: {
      create: vi.fn().mockResolvedValue({ id: "call1" }),
    },
  };
  const email = {} as any;
  const storage = {} as any;
  const service = new CandidatesService(prisma as any, email, storage);
  return { service, prisma };
}

describe("CandidatesService.update — פעולה בלחיצה נשמרת ל-DB", () => {
  it("שינוי סטטוס תקין קורא ל-prisma.candidate.update עם הנתונים", async () => {
    const { service, prisma } = makeService("new");
    await service.update("cand1", { status: "in_progress" });

    expect(prisma.candidate.update).toHaveBeenCalledTimes(1);
    expect(prisma.candidate.update).toHaveBeenCalledWith({
      where: { id: "cand1" },
      data: { status: "in_progress" },
    });
  });

  it("מעבר סטטוס לא חוקי נחסם — שום כתיבה ל-DB", async () => {
    const { service, prisma } = makeService("new");
    await expect(
      service.update("cand1", { status: "hired" }),
    ).rejects.toThrow();
    expect(prisma.candidate.update).not.toHaveBeenCalled();
  });

  it("שמירת הערות נכתבת ל-DB", async () => {
    const { service, prisma } = makeService("in_progress");
    await service.update("cand1", { notes: "שיחה טובה" });
    expect(prisma.candidate.update).toHaveBeenCalledWith({
      where: { id: "cand1" },
      data: { notes: "שיחה טובה" },
    });
  });
});

describe("CandidatesService.addCallLog — שיחה נשמרת ל-DB", () => {
  it("יוצר רשומת CallLog דרך prisma", async () => {
    const { service, prisma } = makeService();
    await service.addCallLog("cand1", {
      staffName: "באשי",
      summary: "תיאום ראיון",
    });
    expect(prisma.callLog.create).toHaveBeenCalledTimes(1);
    const arg = prisma.callLog.create.mock.calls[0][0];
    expect(arg.data.candidateId).toBe("cand1");
    expect(arg.data.summary).toBe("תיאום ראיון");
  });
});
