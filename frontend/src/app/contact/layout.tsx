import type { Metadata } from "next";

// עמוד "צור קשר" הוא Client Component ולכן לא יכול לייצא metadata בעצמו —
// ה-metadata מוגדר כאן ב-layout העוטף.
export const metadata: Metadata = {
  title: "צור קשר",
  description:
    "צור קשר עם דער שטעלע — סוכנות השמה לציבור החרדי. שמחים לשמוע, בין אם אתם מועמדים ובין אם אתם מעסיקים המחפשים כוח אדם.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
