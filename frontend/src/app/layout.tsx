import type { Metadata } from "next";
import { Heebo, Frank_Ruhl_Libre } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { ConstructionBanner } from "@/components/layout/ConstructionBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalReminderAlert } from "@/components/admin/GlobalReminderAlert";
import { AuthProvider } from "@/hooks/useAuth";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

// Heebo — גוף וממשק
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Frank Ruhl Libre — סריף עברי לכותרות
const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // מאפשר אינדוקס מלא; דפים פרטיים נחסמים ב-robots.ts
  robots: { index: true, follow: true },
  // אין מדיה חברתית — פרטיות (ללא Open Graph בכוונה)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frankRuhl.variable}`}
    >
      <body className="flex flex-col min-h-screen font-sans">
        <AuthProvider>
          <ConstructionBanner />
          <Header />
          <GlobalReminderAlert />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
