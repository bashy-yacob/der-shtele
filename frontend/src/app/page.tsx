import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getPublicJobs,
  getPublishedTestimonials,
  getPublicStats,
} from "@/lib/api";
import { JobCard } from "@/components/jobs/JobCard";
import { TestimonialsCarousel } from "@/components/marketing/TestimonialsCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { buttonClass } from "@/components/ui/Button";
import {
  ShieldCheck,
  Handshake,
  Gift,
  Target,
  HandHeart,
  CaretDown,
  ArrowLeft,
  Briefcase,
} from "@/lib/icons";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  CONTACT_INFO,
} from "@/lib/constants";

export const metadata: Metadata = {
  // כותרת מלאה לעמוד הבית (עוקפת את תבנית ה-"%s | דער שטעלע")
  title: { absolute: `${SITE_NAME} — סוכנות השמה לציבור החרדי` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

// Structured data — מזהה את האתר כסוכנות השמה (Google Knowledge Graph / Rich Results).
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: CONTACT_INFO.email,
  logo: `${SITE_URL}/logo.svg`,
  areaServed: { "@type": "Country", name: "ישראל" },
  knowsLanguage: ["he"],
};

const CONTENT = {
  hero: {
    title: "המשרה הנכונה מחכה לך — בלי לחפש, בלי להיחשף",
    subtitle:
      "דער שטעלע היא סוכנות השמה לציבור החרדי. נרשמים, שולחים קורות חיים — והצוות שלנו עושה את כל השאר. כל פנייה עוברת דרכנו, והמעסיק לא רואה את הפרטים שלך עד הרגע הנכון.",
    primary: "הרשמה וחיפוש משרות",
    secondary: "צפייה במשרות הפתוחות",
    pills: [
      { label: "דיסקרטיות מלאה", icon: ShieldCheck },
      { label: "ליווי אישי של הצוות", icon: Handshake },
      { label: "הרשמה חינם", icon: Gift },
    ],
  },
  why: {
    eyebrow: "למה דרכנו",
    title: "לא לוח מודעות. סוכנות שעובדת בשבילך.",
    subtitle:
      "מאחורי הקלעים אנחנו עושים את כל המלאכה — כדי שתמצא/י את המקום הנכון בשקט ובכבוד.",
    cards: [
      {
        title: "דיסקרטיות מלאה",
        desc: "המעסיק אף פעם לא רואה את הפרטים שלך ישירות. כל קשר עובר דרך הצוות — אתה נחשף רק כשזה באמת מתאים.",
        icon: ShieldCheck,
      },
      {
        title: "בלי לרדוף אחרי אף אחד",
        desc: "אין צורך לרדוף אחרי מעסיקים. שולחים קורות חיים פעם אחת, ואנחנו מציגים אותך למשרות הנכונות.",
        icon: Handshake,
      },
      {
        title: "התאמה אמיתית, לא הצפה",
        desc: "לומדים מה מתאים לך ופונים אליך רק כשיש משהו קונקרטי. בלי עשרות מיילים, בלי רעש.",
        icon: Target,
      },
      {
        title: "סביבה שמכבדת אותך",
        desc: "ממשק נקי ומכובד. צוות שמכיר את הציבור ועובד לפי ערכיו.",
        icon: HandHeart,
      },
    ],
  },
  steps: {
    eyebrow: "איך זה עובד",
    title: "שלושה צעדים פשוטים — והשאר עלינו",
    list: [
      {
        title: "נרשמים",
        desc: "פותחים חשבון חינמי בדקה אחת — בלי טפסים מסובכים ובלי שום התחייבות.",
      },
      {
        title: "שולחים קורות חיים",
        desc: "בוחרים משרות שמדברות אליך ומגישים — ומכאן אנחנו מטפלים בכל השאר.",
      },
      {
        title: "מקבלים הצעה",
        desc: "מוצאים לך את ההתאמה הנכונה וחוזרים אליך עם הצעה קונקרטית — בלי הצפה ובלי לחץ.",
      },
    ],
  },
  faq: {
    eyebrow: "שאלות נפוצות",
    title: "מה שחשוב לדעת",
    list: [
      {
        q: "המעסיק יֵדע מי אני?",
        a: "לא. כל הפרטים שלך נשארים אצל הצוות בלבד. מעסיק רואה אותך רק אחרי שסיננו והתאמנו — ובאישורך.",
      },
      {
        q: "כמה זה עולה לי?",
        a: "למועמדים השירות חינמי לחלוטין — הרשמה, הגשה וליווי לאורך כל הדרך.",
      },
      {
        q: "אין כרגע משרה שמתאימה לי. כדאי בכל זאת להירשם?",
        a: "בהחלט. נרשמים ומשאירים קורות חיים, וברגע שתיפתח משרה מתאימה באזור שלך — ניצור קשר.",
      },
      {
        q: "תשלחו לי הודעות בשבת?",
        a: "לעולם לא. אנחנו לא שולחים מיילים או הודעות בשבת ובימים טובים.",
      },
      {
        q: "מה קורה אחרי שאני מגיש מועמדות?",
        a: "הצוות עובר על המועמדות, וכשנמצא התאמה ניצור איתך קשר עם פרטים קונקרטיים. אין צורך לעשות דבר בינתיים.",
      },
    ],
  },
};

export default async function HomePage() {
  const [jobs, testimonials, siteStats] = await Promise.all([
    getPublicJobs(),
    getPublishedTestimonials(),
    getPublicStats(),
  ]);
  const latest = jobs.slice(0, 4);

  const stats = [
    { to: jobs.length, suffix: "+", label: "משרות פתוחות עכשיו" },
    { to: 100, suffix: "%", label: "דיסקרטי — הפרטים נשארים אצלנו" },
    // ערך זמני (placeholder) — להחליף ב-SLA האמיתי של הצוות.
    { to: 48, suffix: "", label: "שעות עד מענה מהצוות" },
    // נמשך חי מהמערכת — ספירת המעסיקים המאושרים.
    { to: siteStats.employers, suffix: "", label: "מעסיקים שעובדים איתנו" },
  ];

  return (
    <div dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
      />
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-navy-700 md:bg-transparent border-b border-navy-800 md:border-navy-700 text-white">
        {/* תמונת רקע מלאה — דסקטופ בלבד (במובייל מוצגת תמונה קטנה וממוסגרת) */}
        <div className="absolute inset-0 hidden md:block" aria-hidden="true">
          <Image
            src="/hero-handshake.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* שכבת-על סגולה — לקריאות הטקסט ולמעבר רך אל פס הסטטיסטיקות */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-800/80 via-navy-700/55 to-navy-600/30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-24 lg:py-28 text-center">
          <h1 className="font-display text-white text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-up [text-shadow:0_2px_24px_rgba(21,15,36,0.45)]">
            {CONTENT.hero.title}
          </h1>

          {/* תמונה קטנה וממוסגרת — מובייל בלבד (במקום הקרופ של תמונת המסך המלא) */}
          <div className="md:hidden mx-auto mb-8 max-w-xs animate-fade-up">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/15 bg-white shadow-lift">
              <Image
                src="/hero-handshake.jpg"
                alt="לחיצת יד — שיתוף פעולה בין מועמד למעסיק"
                fill
                priority
                sizes="20rem"
                className="object-cover object-center"
              />
            </div>
          </div>

          <p
            className="text-sand-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {CONTENT.hero.subtitle}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-olive-500 hover:bg-olive-600 text-white font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center shadow-lift"
            >
              {CONTENT.hero.primary}
              <ArrowLeft className="w-5 h-5 shrink-0" weight="bold" />
            </Link>
            <Link
              href="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/70 text-white hover:bg-white/10 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              <Briefcase className="w-5 h-5 shrink-0" />
              {CONTENT.hero.secondary}
            </Link>
          </div>

          {/* תגיות אמון קטנות */}
          <ul
            className="mt-10 flex flex-wrap justify-center gap-x-3 gap-y-2 animate-fade-up"
            style={{ animationDelay: "360ms" }}
          >
            {CONTENT.hero.pills.map((pill) => {
              const Icon = pill.icon;
              return (
                <li
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 text-white text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  <Icon className="w-[1.05rem] h-[1.05rem] text-olive-300 shrink-0" />
                  {pill.label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ======== פס סטטיסטיקות ======== */}
      <section className="bg-navy-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
            {stats.map((stat, idx) => (
              <Reveal key={stat.label} delay={idx * 90} className="text-center">
                <div className="font-display text-4xl sm:text-5xl font-bold text-olive-300 mb-1.5">
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </div>
                <p className="text-sand-200 text-sm leading-snug max-w-[12rem] mx-auto">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== למה דרכנו ======== */}
      <section className="bg-sand-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow={CONTENT.why.eyebrow}
              title={CONTENT.why.title}
              subtitle={CONTENT.why.subtitle}
              className="mb-14 mx-auto"
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {CONTENT.why.cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.title} delay={idx * 90}>
                  <div className="h-full flex gap-4 bg-white border border-sand-200 rounded-2xl shadow-soft p-6 transition-shadow hover:shadow-lift">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-olive-100 text-olive-700 shrink-0">
                      <Icon className="w-7 h-7" />
                    </span>
                    <div>
                      <h3 className="font-display text-ink-900 text-xl font-bold mb-2">
                        {card.title}
                      </h3>
                      <p className="text-ink-700 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======== שלושה שלבים ======== */}
      <section className="bg-white border-y border-sand-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow={CONTENT.steps.eyebrow}
              title={CONTENT.steps.title}
              className="mb-14"
            />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {CONTENT.steps.list.map((step, idx) => (
              <Reveal key={step.title} delay={idx * 110}>
                <div className="h-full flex flex-col items-start gap-4 bg-sand-50 border border-sand-200 rounded-2xl shadow-soft p-6">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-olive-100 text-olive-700 font-display text-xl font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="font-display text-ink-900 text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-ink-700 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-12 text-center">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              פותחים חשבון — דקה אחת ←
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ======== הצצה למשרות חיות ======== */}
      <section className="bg-sand-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <SectionHeading
                align="start"
                eyebrow="משרות פתוחות"
                title="משרות חדשות שמחכות לך"
                subtitle="כל משרה עוברת דרכנו — ושם החברה נחשף רק אחרי שהצוות סינן והתאים."
              />
              <Link
                href="/jobs"
                className="shrink-0 text-navy-600 hover:text-navy-700 font-bold whitespace-nowrap"
              >
                לכל המשרות ←
              </Link>
            </div>
          </Reveal>

          {latest.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {latest.map((job, idx) => (
                <Reveal key={job.id} delay={idx * 80}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-10 text-center">
              <p className="text-ink-700 mb-6 leading-relaxed">
                כרגע אין משרות פתוחות להצגה. השאירו פרטים ונעדכן אתכם כשתיפתח
                משרה מתאימה.
              </p>
              <Link href="/register" className={buttonClass("primary", "md")}>
                להרשמה ←
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ======== המלצות לקוחות ======== */}
      {testimonials.length > 0 && (
        <section className="bg-white border-t border-sand-200 py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <SectionHeading
                eyebrow="ממליצים עלינו"
                title="אלה שכבר עברו דרכנו — מספרים"
                subtitle="כמה מילים ממועמדים וממעסיקים שליווינו — בשמירה על פרטיותם."
                className="mb-12"
              />
            </Reveal>
            <Reveal>
              <TestimonialsCarousel items={testimonials} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ======== שאלות נפוצות ======== */}
      <section className="bg-sand-50 border-t border-sand-200 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow={CONTENT.faq.eyebrow}
              title={CONTENT.faq.title}
              className="mb-12"
            />
          </Reveal>
          <div className="space-y-3">
            {CONTENT.faq.list.map((item, idx) => (
              <Reveal key={item.q} delay={idx * 60}>
                <details className="group bg-sand-50 border border-sand-200 rounded-2xl px-5 py-4 [&_summary]:list-none open:shadow-soft">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer font-display text-lg font-bold text-ink-900">
                    {item.q}
                    <CaretDown
                      className="w-5 h-5 text-olive-600 shrink-0 transition-transform duration-200 group-open:rotate-180"
                      weight="bold"
                    />
                  </summary>
                  <p className="text-ink-700 leading-relaxed mt-3">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA סוגר ======== */}
      <section className="bg-sand-100 py-20 px-4">
        <Reveal>
          <div className="max-w-3xl mx-auto bg-navy-600 rounded-2xl px-8 py-12 sm:py-14 text-center">
            <h2 className="font-display text-white text-3xl font-bold mb-4">
              המשרה הנכונה מחכה. נתחיל?
            </h2>
            <p className="text-sand-200 mb-8 max-w-md mx-auto leading-relaxed">
              הרשמה לוקחת דקה. מכאן — אנחנו כבר דואגים לכל השאר.
            </p>
            <Link href="/register" className={buttonClass("secondary", "lg")}>
              הרשמה וחיפוש משרות
              <ArrowLeft className="w-5 h-5 shrink-0" weight="bold" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
