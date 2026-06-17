import { describe, it, expect } from "vitest";
import {
  canTransitionCandidate,
  assertCandidateTransition,
  canTransitionJob,
  assertJobTransition,
  canTransitionPlacement,
  assertPlacementTransition,
} from "../src/common/status-machine/status-machine";

describe("status-machine — מועמד", () => {
  it("מעברים חוקיים", () => {
    expect(canTransitionCandidate("new", "in_progress")).toBe(true);
    expect(canTransitionCandidate("in_progress", "presented")).toBe(true);
    expect(canTransitionCandidate("presented", "hired")).toBe(true);
  });

  it("מעברים לא חוקיים", () => {
    expect(canTransitionCandidate("new", "hired")).toBe(false);
    expect(canTransitionCandidate("hired", "in_progress")).toBe(false);
  });

  it("assert זורק על מעבר לא חוקי", () => {
    expect(() => assertCandidateTransition("new", "hired")).toThrow();
    expect(() => assertCandidateTransition("new", "in_progress")).not.toThrow();
  });
});

describe("status-machine — משרה", () => {
  it("מעברים חוקיים ולא חוקיים", () => {
    expect(canTransitionJob("active", "filled")).toBe(true);
    expect(canTransitionJob("closed", "active")).toBe(false);
  });

  it("assert זורק על מעבר לא חוקי", () => {
    expect(() => assertJobTransition("closed", "active")).toThrow();
    expect(() => assertJobTransition("active", "paused")).not.toThrow();
  });
});

describe("status-machine — גיוס", () => {
  it("המסלול התקין: pending → confirmed → guarantee → completed", () => {
    expect(canTransitionPlacement("pending", "confirmed")).toBe(true);
    expect(canTransitionPlacement("confirmed", "guarantee")).toBe(true);
    expect(canTransitionPlacement("guarantee", "completed")).toBe(true);
  });

  it("לא ניתן לדלג ישירות מ-pending ל-completed", () => {
    expect(canTransitionPlacement("pending", "completed")).toBe(false);
    expect(() => assertPlacementTransition("pending", "completed")).toThrow();
  });

  it("ביטול אפשרי מ-guarantee (החזר חלקי)", () => {
    expect(canTransitionPlacement("guarantee", "cancelled")).toBe(true);
  });
});
