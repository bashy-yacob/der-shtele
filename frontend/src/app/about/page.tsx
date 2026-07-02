import type { Metadata } from "next";
import Link from "next/link";
import type { Icon } from "@/lib/icons";
import {
  Lock,
  HandHeart,
  ShieldCheck,
  UsersThree,
  CheckCircle,
  ArrowLeft,
} from "@/lib/icons";
import { SITE_CONTENT } from "@/lib/constants";
import { Card, SectionHeading, Reveal } from "@/components/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "לעובדים",
  description:
    "מחפש עבודה? דער שטעלע — סוכנות השמה שנבנתה מתוך הציבור החרדי ובשבילו. מכירים את הציבור, שומרים על צניעות ופרטיות, ומלווים כל גיוס באופן אישי.",
  alternates: { canonical: "/about" },
};

// אייקון לכל ערך (לפי סדר הפריטים ב-constants.about.values)
const VALUE_ICONS: Icon[] = [
  Lock, // פרטיות
  HandHeart, // צניעות
  ShieldCheck, // אמינות
  UsersThree, // קהילה
];

// רצועת הבטחות — מזוקקת מהערכים והכללים הקיימים (לא ניסוח שיווקי חדש).
const PROMISES = [
  "חינמי לחלוטין",
  "בלי תמונות אנשים",
  "בלי קשר ישיר ללא אישורך",
  "ליווי אישי לאורך כל הדרך",
];

const PROCESS_STEPS = [
  {
    title: "שולחים קורות חיים",
    desc: "דרך האתר — עם הפרטים ותחום העיסוק שמעניין אותך",
  },
  {
    title: "הצוות עובר על הפנייה",
    desc: "בודקים התאמה למשרות הפתוחות ולמאגר המעסיקים שלנו",
  },
  {
    title: "שיחת היכרות",
    desc: "אם צריך, נציג מהצוות יוצר קשר טלפוני להבנת הצרכים",
  },
  {
    title: "הצגה למעסיק",
    desc: "מציגים אותך למעסיק המתאים — רק לאחר אישורך",
  },
  {
    title: "גיוס מוצלח",
    desc: "מלווים אותך עד הקליטה — ונשארים זמינים גם אחריה",
  },
];

export default function AboutPage() {
  return (
    <main dir="rtl">
      {/* Hero — רצועת מותג כהה (אמון-first) */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-navy-600 to-navy-800 px-4 py-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -start-12 h-56 w-56 rounded-full bg-white/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -end-10 h-72 w-72 rounded-full bg-olive-500/10"
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-olive-300 mb-4 animate-fade-up">
            אודות · למחפשי עבודה
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-tight mb-4 animate-fade-up">
            {SITE_CONTENT.about.title}
          </h1>
          <p
            className="text-lg sm:text-xl text-navy-100 leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {SITE_CONTENT.about.subtitle}
          </p>
          <div
            className="mt-8 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/register" className={buttonClass("secondary", "lg")}>
              הרשמה ושליחת קורות חיים
              <ArrowLeft className="w-5 h-5 shrink-0" weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* רצועת הבטחות */}
      <section className="bg-navy-900 px-4 py-5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-sm text-navy-100">
          {PROMISES.map((promise) => (
            <span key={promise} className="inline-flex items-center gap-1.5">
              <CheckCircle
                className="w-4 h-4 text-olive-300 shrink-0"
                weight="fill"
              />
              {promise}
            </span>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto py-20 px-4">
        <Reveal>
          <SectionHeading
            eyebrow="מי אנחנו"
            title="הסיפור שלנו"
            align="start"
            className="mb-6"
          />
          <p className="text-lg text-ink-700 leading-relaxed">
            {SITE_CONTENT.about.story}
          </p>
        </Reveal>
      </section>

      {/* Values — רשת-אמון */}
      <section className="bg-sand-50 py-20 px-4 border-y border-sand-200">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="העקרונות שלנו"
              title="ערכי הסוכנות"
              align="start"
              className="mb-10"
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {SITE_CONTENT.about.values.map((value, idx) => {
              const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
              return (
                <Reveal key={idx} delay={idx * 90} className="h-full">
                  <Card className="h-full flex items-start gap-4 p-5 transition-shadow hover:shadow-lift">
                    <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-olive-100 text-olive-700 shrink-0">
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-ink-900 text-lg font-bold mb-1">
                        {value.title}
                      </h3>
                      <p className="text-ink-700 leading-relaxed text-sm">
                        {value.desc}
                      </p>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-3xl mx-auto py-20 px-4">
        <Reveal>
          <SectionHeading
            eyebrow="התהליך"
            title="איך עובדים איתנו — מצד המועמד"
            align="start"
            className="mb-10"
          />
        </Reveal>
        <div className="space-y-6">
          {PROCESS_STEPS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 80}>
              <div className="flex gap-4">
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA סוגר */}
      <section className="bg-sand-100 py-20 px-4 border-t border-sand-200">
        <Reveal>
          <div className="max-w-3xl mx-auto bg-navy-600 rounded-2xl px-8 py-12 sm:py-14 text-center">
            <h2 className="font-display text-white text-3xl font-bold mb-4">
              מוכן למצוא את המקום הנכון?
            </h2>
            <p className="text-sand-200 mb-8 max-w-md mx-auto leading-relaxed">
              הרשמה לוקחת דקה, והשירות חינמי לחלוטין. מכאן — אנחנו כבר דואגים
              לכל השאר.
            </p>
            <Link href="/register" className={buttonClass("secondary", "lg")}>
              הרשמה ושליחת קורות חיים
              <ArrowLeft className="w-5 h-5 shrink-0" weight="bold" />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
