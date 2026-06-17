import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTENT } from "@/lib/constants";
import { Card, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "למעסיקים" };

const EMP = SITE_CONTENT.employers;

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
              href="/employers/contact"
              className="w-full sm:w-auto bg-navy-600 hover:bg-navy-700 text-white font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonPrimary}
            </Link>
            <Link
              href="/employers/terms"
              className="w-full sm:w-auto border border-navy-600 text-navy-600 hover:bg-navy-50 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonSecondary}
            </Link>
          </div>
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
            {EMP.why.items.map((item, idx) => (
              <Card key={idx} className="p-8 border-r-4 border-r-olive-500">
                <h3 className="font-display text-ink-900 text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-ink-700 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
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
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">
            יש לכם משרה? בואו נמצא לה את האדם הנכון
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/employers/contact"
              className="w-full sm:w-auto bg-white hover:bg-sand-100 text-navy-700 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonPrimary}
            </Link>
            <Link
              href="/employers/terms"
              className="w-full sm:w-auto border border-sand-200 text-white hover:bg-navy-700 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
            >
              {EMP.hero.buttonSecondary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
