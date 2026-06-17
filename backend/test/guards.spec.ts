import { describe, it, expect } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { RolesGuard } from "../src/common/guards/roles.guard";
import { JwtAuthGuard } from "../src/common/guards/jwt-auth.guard";

// Reflector מזויף שמחזיר ערך קבוע ל-getAllAndOverride.
function fakeReflector(value: unknown) {
  return { getAllAndOverride: () => value } as any;
}

// ExecutionContext מזויף עם user נתון.
function fakeCtx(user?: { role: string }) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe("RolesGuard — הגנת CRM מפני גישה לא מורשית", () => {
  it("admin עובר כשנדרש staff/admin", () => {
    const guard = new RolesGuard(fakeReflector(["staff", "admin"]));
    expect(guard.canActivate(fakeCtx({ role: "admin" }))).toBe(true);
  });

  it("staff עובר כשנדרש staff/admin", () => {
    const guard = new RolesGuard(fakeReflector(["staff", "admin"]));
    expect(guard.canActivate(fakeCtx({ role: "staff" }))).toBe(true);
  });

  it("מועמד (candidate) נחסם — ForbiddenException (403)", () => {
    const guard = new RolesGuard(fakeReflector(["staff", "admin"]));
    expect(() => guard.canActivate(fakeCtx({ role: "candidate" }))).toThrow(
      ForbiddenException,
    );
  });

  it("ללא משתמש כלל — נחסם (403)", () => {
    const guard = new RolesGuard(fakeReflector(["admin"]));
    expect(() => guard.canActivate(fakeCtx(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it("staff נחסם כשנדרש admin בלבד (עמלות)", () => {
    const guard = new RolesGuard(fakeReflector(["admin"]));
    expect(() => guard.canActivate(fakeCtx({ role: "staff" }))).toThrow(
      ForbiddenException,
    );
  });

  it("route ללא @Roles — מותר לכל מאומת", () => {
    const guard = new RolesGuard(fakeReflector(undefined));
    expect(guard.canActivate(fakeCtx({ role: "candidate" }))).toBe(true);
  });
});

describe("JwtAuthGuard — מעקף @Public", () => {
  it("route ציבורי (@Public) עובר ללא אימות", () => {
    const guard = new JwtAuthGuard(fakeReflector(true));
    expect(guard.canActivate(fakeCtx(undefined))).toBe(true);
  });
});
