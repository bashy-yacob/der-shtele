// תצורת ESLint למינימום שמיש (eslint 8, legacy config) — הצוות לא הגדיר עד כה.
// ממוקדת ב-src בלבד; פונקציות טהורות, NestJS, ללא כללי עיצוב נוקשים.
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: { node: true, es2021: true },
  ignorePatterns: [
    "dist",
    "node_modules",
    "test",
    "prisma",
    "*.config.ts",
    ".eslintrc.js",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
