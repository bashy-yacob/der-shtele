import Link from "next/link";
import { getPublicJobs } from "@/lib/api";
import { JobCard } from "@/components/jobs/JobCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkylineMotif } from "@/components/ui/SkylineMotif";

const CONTENT = {
  hero: {
    title: "דער שטעלע — מוצאים לך את המשרה הנכונה",
    subtitle:
      "סוכנות השמה מקצועית לציבור החרדי בישראל. אנחנו מטפלים בכל הפרטים — אתם מתמקדים בעבודה.",
    primary: "הרשמה וחיפוש משרות ←",
    secondary: "צפה במשרות הפתוחות",
  },
  trust: ["מעסיק לא רואה את הפרטים שלך", "הכל עובר דרך הצוות", "ללא פרסומות"],
  steps: {
    eyebrow: "איך זה עובד",
    title: "שלושה שלבים — וזה אצלנו",
    list: [
      { title: "נרשמים", desc: "יוצרים חשבון חינמי — לוקח דקה." },
      {
        title: "שולחים קורות חיים",
        desc: "מגישים למשרות שמתאימות, והצוות מטפל בהכל.",
      },
      {
        title: "מקבלים הצעה",
        desc: "אם נמצאה התאמה — ניצור אתכם קשר עם הצעה קונקרטית.",
      },
    ],
  },
};

export default async function HomePage() {
  const jobs = await getPublicJobs();
  const latest = jobs.slice(0, 4);

  return (
    <div dir="rtl">
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-sand-100 border-b border-sand-200">
        {/* מוטיב קו-רקיע עדין בתחתית */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 text-sand-300/70"
          aria-hidden="true"
        >
          <SkylineMotif className="w-full h-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-28 text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            {CONTENT.hero.title}
          </h1>
          <p className="text-ink-700 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {CONTENT.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-navy-600 hover:bg-navy-700 text-white font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {CONTENT.hero.primary}
            </Link>
            <Link
              href="/jobs"
              className="w-full sm:w-auto border border-navy-600 text-navy-600 hover:bg-navy-50 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {CONTENT.hero.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ======== פס אמון ======== */}
      <section className="bg-navy-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm sm:text-base font-semibold">
          {CONTENT.trust.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-olive-300 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ======== הצצה למשרות חיות ======== */}
      <section className="bg-sand-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <SectionHeading
              align="start"
              eyebrow="משרות פתוחות"
              title="הצצה למשרות האחרונות"
              subtitle="כל המשרות מועברות דרכנו — פרטי החברה נמסרים רק לאחר אישור הצוות."
            />
            <Link
              href="/jobs"
              className="shrink-0 text-navy-600 hover:text-navy-700 font-bold whitespace-nowrap"
            >
              לכל המשרות ←
            </Link>
          </div>

          {latest.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-sand-200 rounded-2xl shadow-soft p-10 text-center">
              <p className="text-ink-700 mb-6 leading-relaxed">
                כרגע אין משרות פתוחות להצגה. השאירו פרטים ונעדכן אתכם כשתיפתח
                משרה מתאימה.
              </p>
              <Link
                href="/register"
                className="inline-flex bg-navy-600 hover:bg-navy-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
              >
                להרשמה ←
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ======== שלושה שלבים ======== */}
      <section className="bg-white border-y border-sand-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow={CONTENT.steps.eyebrow}
            title={CONTENT.steps.title}
            className="mb-14"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {CONTENT.steps.list.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start gap-4 bg-sand-50 border border-sand-200 rounded-2xl shadow-soft p-7"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-olive-100 text-olive-700 font-display text-xl font-bold shrink-0">
                  {idx + 1}
                </span>
                <h3 className="font-display text-ink-900 text-xl font-bold">
                  {step.title}
                </h3>
                <p className="text-ink-700 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA סוגר ======== */}
      <section className="bg-sand-100 py-20 px-4">
        <div className="max-w-3xl mx-auto bg-navy-600 rounded-3xl px-8 py-12 sm:py-14 text-center">
          <h2 className="font-display text-white text-3xl font-bold mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-sand-200 mb-8 max-w-md mx-auto leading-relaxed">
            הרשמה קצרה, ואנחנו כבר נדאג לחפש עבורכם את המשרה המתאימה ביותר.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-olive-500 hover:bg-olive-600 text-white font-bold text-lg px-10 py-3.5 rounded-xl transition-colors duration-150"
          >
            הרשמה וחיפוש משרות ←
          </Link>
        </div>
      </section>
    </div>
  );
}
