import type { Metadata } from "next";
import Link from "next/link";
import type { Icon } from "@/lib/icons";
import {
  Funnel,
  HandCoins,
  ShieldCheck,
  Lock,
  Clock,
  UsersThree,
} from "@/lib/icons";
import { SITE_CONTENT } from "@/lib/constants";
import { Card, SectionHeading, buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "למעסיקים",
  description:
    "מחפשים עובד? דער שטעלע מסננת, מתאימה ומציגה מועמדים מהציבור החרדי. תשלום רק על תוצאה, ערבות שלושה חודשים ודיסקרטיות מלאה.",
  alternates: { canonical: "/employers" },
};

const EMP = SITE_CONTENT.employers;

// אייקון לכל יתרון (לפי סדר הפריטים ב-constants.employers.why.items)
const WHY_ICONS: Icon[] = [
  Funnel, // סינון מקצועי מלא
  HandCoins, // תשלום רק על תוצאה
  ShieldCheck, // ערבות שלושה חודשים
  Lock, // דיסקרטיות מלאה
  Clock, // חוסכים לכם זמן
  UsersThree, // מכירים את הציבור
];

export default function EmployersPage() {
  return (
    <main dir="rtl">
      {/* ======== HERO ======== */}
      <section className="bg-sand-100 py-16 sm:py-20 px-4 border-b border-sand-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold leading-tight mb-5">
            {EMP.hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-ink-700 leading-relaxed mb-8">
            {EMP.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/portal/register"
              className={buttonClass("primary", "lg", "w-full sm:w-auto")}
            >
              {EMP.hero.buttonRegister}
            </Link>
            <Link
              href="/employers/contact"
              className={buttonClass("outline", "lg", "w-full sm:w-auto")}
            >
              {EMP.hero.buttonPrimary}
            </Link>
          </div>
          <p className="text-sm text-ink-500 mt-6">
            כבר יש לכם חשבון?{" "}
            <Link
              href="/portal/login"
              className="font-semibold text-navy-600 hover:underline"
            >
              כניסה לפורטל המעסיקים ←
            </Link>
          </p>
        </div>
      </section>

      {/* ======== למה כדאי לפרסם אצלנו ======== */}
      <section className="bg-sand-50 py-16 px-4 border-b border-sand-200">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow={EMP.why.eyebrow}
            title={EMP.why.title}
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EMP.why.items.map((item, idx) => {
              const Icon = WHY_ICONS[idx % WHY_ICONS.length];
              return (
                <Card key={idx} className="p-8 border-s-4 border-s-olive-500">
                  <span className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-olive-100 text-olive-700">
                    <Icon className="w-7 h-7" />
                  </span>
                  <h3 className="font-display text-ink-900 text-xl font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-ink-700 leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== התהליך מצד המעסיק ======== */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <SectionHeading
          eyebrow={EMP.process.eyebrow}
          title={EMP.process.title}
          align="start"
          className="mb-8"
        />
        <ol className="space-y-6">
          {EMP.process.steps.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-navy-600 text-white font-bold">
                  {idx + 1}
                </div>
              </div>
              <div>
                <h3 className="font-display text-ink-900 font-bold text-lg">
                  {item.title}
                </h3>
                <p className="text-ink-700 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </ol>
      </section>

      {/* ======== פס אמון + CTA ======== */}
      <section className="bg-navy-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sand-200 text-sm sm:text-base mb-6">{EMP.trust}</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6 text-white">
            יש לכם משרה? בואו נמצא לה את האדם הנכון
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/portal/register"
              className="w-full sm:w-auto bg-white hover:bg-sand-100 text-navy-700 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonRegister}
            </Link>
            <Link
              href="/employers/contact"
              className="w-full sm:w-auto border border-sand-200 text-white hover:bg-navy-700 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonPrimary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
