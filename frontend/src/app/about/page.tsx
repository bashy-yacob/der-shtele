import type { Metadata } from "next";
import Link from "next/link";
import type { Icon } from "@/lib/icons";
import {
  Lock,
  HandHeart,
  ShieldCheck,
  UsersThree,
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
      {/* Hero Section */}
      <section className="bg-sand-100 py-16 sm:py-20 px-4 border-b border-sand-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold leading-tight mb-4 animate-fade-up">
            {SITE_CONTENT.about.title}
          </h1>
          <p
            className="text-lg sm:text-xl text-ink-500 leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {SITE_CONTENT.about.subtitle}
          </p>
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

      {/* Values */}
      <section className="bg-sand-50 py-20 px-4 border-y border-sand-200">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="העקרונות שלנו"
              title="ערכי הסוכנות"
              align="start"
              className="mb-14"
            />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SITE_CONTENT.about.values.map((value, idx) => {
              const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
              return (
                <Reveal key={idx} delay={idx * 90} className="h-full">
                  <Card className="h-full p-6 text-center transition-shadow hover:shadow-lift">
                    <span className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-olive-100 text-olive-700">
                      <Icon className="w-7 h-7" />
                    </span>
                    <h3 className="font-display text-ink-900 text-lg font-bold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-ink-700 leading-relaxed text-sm">
                      {value.desc}
                    </p>
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
