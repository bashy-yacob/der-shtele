import { defineConfig } from "vitest/config";

// בדיקות יחידה ללוגיקה העסקית הקריטית + שומרי הרשאות.
// אינן דורשות DB חי — פונקציות טהורות ו-guards עם mocks.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.spec.ts"],
  },
});
