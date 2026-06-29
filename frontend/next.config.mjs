/** @type {import('next').NextConfig} */
const nextConfig = {
  // RTL support - Hebrew only
  i18n: {
    locales: ["he"],
    defaultLocale: "he",
  },
  experimental: {
    // ייבוא מודולרי של אייקונים — זמני build/dev מהיר וצרור קטן יותר
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
