import { describe, it, expect } from "vitest";
import {
  pageArgs,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../src/common/pagination/pagination";

describe("pageArgs", () => {
  it("ברירת מחדל — עמוד 1, גודל ברירת המחדל, skip 0", () => {
    expect(pageArgs({})).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
    });
  });

  it("מחשב skip נכון לפי עמוד וגודל", () => {
    expect(pageArgs({ page: 3, pageSize: 15 })).toEqual({
      page: 3,
      pageSize: 15,
      skip: 30,
      take: 15,
    });
  });

  it("חוסם עמוד קטן מ-1 ל-1 (skip 0)", () => {
    const r = pageArgs({ page: 0, pageSize: 10 });
    expect(r.page).toBe(1);
    expect(r.skip).toBe(0);
  });

  it("חוסם עמוד שלילי ל-1", () => {
    expect(pageArgs({ page: -5, pageSize: 10 }).page).toBe(1);
  });

  it("תוקע pageSize ענק לתקרה (מונע משיכת כל הטבלה)", () => {
    const r = pageArgs({ page: 1, pageSize: 100000 });
    expect(r.pageSize).toBe(MAX_PAGE_SIZE);
    expect(r.take).toBe(MAX_PAGE_SIZE);
  });

  it("חוסם pageSize קטן מ-1 ל-1", () => {
    expect(pageArgs({ page: 1, pageSize: 0 }).pageSize).toBe(1);
  });

  it("מעגל ערכים לא-שלמים כלפי מטה", () => {
    const r = pageArgs({ page: 2.9, pageSize: 10.7 });
    expect(r.page).toBe(2);
    expect(r.pageSize).toBe(10);
    expect(r.skip).toBe(10);
  });
});
