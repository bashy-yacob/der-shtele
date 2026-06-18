import type { Metadata } from "next";

// עמוד "פנייה ושליחת משרה" הוא Client Component ולכן לא יכול לייצא metadata
// בעצמו — ה-metadata מוגדר כאן ב-layout העוטף.
export const metadata: Metadata = {
  title: "פנייה ושליחת משרה — למעסיקים",
  description:
    "מחפשים עובד? מלאו את פרטי המשרה ונחזור אליכם. הפרטים נשמרים אצל הצוות בלבד, בדיסקרטיות מלאה — ותשלום רק על תוצאה.",
  alternates: { canonical: "/employers/contact" },
};

export default function EmployersContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
