import { describe, it, expect, vi } from "vitest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { JobsService } from "../src/modules/jobs/jobs.service";
import { QueryJobsDto } from "../src/modules/jobs/dto/query-jobs.dto";

// מוכיח את הסינון הרב-תחומי מקצה לקצה:
//  1. ה-DTO ממיר `field=logistics,sales` לרשימה ומאמת כל ערך כ-JobField.
//  2. findPublic מתרגם את הרשימה ל-`where.field = { in: [...] }` (OR פנימי).

function makeService(rows: unknown[] = []) {
  const prisma = {
    job: {
      findMany: vi.fn().mockResolvedValue(rows),
    },
  };
  const mailing = {} as any;
  const service = new JobsService(prisma as any, mailing);
  return { service, prisma };
}

describe("QueryJobsDto — רב-בחירה לתחום ולאזור", () => {
  it("מפצל `field=logistics,sales` לרשימה ומאמת אותה", async () => {
    const dto = plainToInstance(QueryJobsDto, { field: "logistics,sales" });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.field).toEqual(["logistics", "sales"]);
  });

  it("תומך גם במופעים חוזרים (`field=a&field=b`) ומנקה רווחים", async () => {
    const dto = plainToInstance(QueryJobsDto, {
      field: ["logistics", " sales "],
      region: "בני ברק, ירושלים",
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.field).toEqual(["logistics", "sales"]);
    expect(dto.region).toEqual(["בני ברק", "ירושלים"]);
  });

  it("דוחה ערך תחום לא חוקי", async () => {
    const dto = plainToInstance(QueryJobsDto, { field: "logistics,bogus" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("JobsService.findPublic — סינון בכמה תחומים בו-זמנית", () => {
  it("מעביר את התחומים כ-`{ in: [...] }` ל-prisma", async () => {
    const { service, prisma } = makeService();
    await service.findPublic({
      field: ["logistics", "sales", "tech"],
    } as QueryJobsDto);

    const where = prisma.job.findMany.mock.calls[0][0].where;
    expect(where.status).toBe("active");
    expect(where.field).toEqual({ in: ["logistics", "sales", "tech"] });
  });

  it("משלב סינון רב-תחומי עם רב-ערים ועם ניסיון", async () => {
    const { service, prisma } = makeService();
    await service.findPublic({
      field: ["admin", "finance"],
      region: ["בני ברק", "ירושלים"],
      experience: "שנה ומעלה",
    } as QueryJobsDto);

    const where = prisma.job.findMany.mock.calls[0][0].where;
    expect(where.field).toEqual({ in: ["admin", "finance"] });
    expect(where.region).toEqual({ in: ["בני ברק", "ירושלים"] });
    expect(where.experience).toBe("שנה ומעלה");
  });

  it("ללא פילטרים — לא מוסיף where.field/region (רשימה ריקה נחשבת כלא-מסונן)", async () => {
    const { service, prisma } = makeService();
    await service.findPublic({ field: [] } as unknown as QueryJobsDto);

    const where = prisma.job.findMany.mock.calls[0][0].where;
    expect(where.field).toBeUndefined();
    expect(where.region).toBeUndefined();
    expect(where.status).toBe("active");
  });

  it("ממיין משרות ממומנות לראש ומחזיר שדות ציבוריים בלבד", async () => {
    const rows = [
      {
        id: "j1",
        title: "רגילה",
        descriptionPublic: "…",
        field: "sales",
        region: "בני ברק",
        scope: "מלאה",
        experience: null,
        openedAt: new Date("2026-01-01"),
        featuredUntil: null,
        featuredPaymentStatus: "unpaid",
      },
      {
        id: "j2",
        title: "ממומנת",
        descriptionPublic: "…",
        field: "tech",
        region: "ירושלים",
        scope: "מלאה",
        experience: null,
        openedAt: new Date("2025-12-01"),
        featuredUntil: new Date("2999-01-01"),
        featuredPaymentStatus: "paid",
      },
    ];
    const { service } = makeService(rows);
    const result = await service.findPublic({} as QueryJobsDto);

    expect(result[0].id).toBe("j2"); // הממומנת קודם
    expect(result[0].featured).toBe(true);
    // שדות פנימיים לא דולפים לתגובה הציבורית.
    expect(result[0]).not.toHaveProperty("featuredPaymentStatus");
    expect(result[0]).not.toHaveProperty("featuredUntil");
  });
});
