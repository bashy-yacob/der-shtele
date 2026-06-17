import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTENT } from "@/lib/constants";
import { Card, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "תנאי העבודה איתנו — למעסיקים" };

const TERMS = SITE_CONTENT.employers.terms;

export default function EmployersTermsPage() {
  return (
    <main dir="rtl">
      {/* ======== HERO ======== */}
      <section className="bg-sand-100 py-16 px-4 border-b border-sand-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold mb-4">
            {TERMS.title}
          </h1>
          <p className="text-lg sm:text-xl text-ink-700 leading-relaxed">
            {TERMS.subtitle}
          </p>
        </div>
      </section>

      {/* ======== מודל העמלה ======== */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <SectionHeading
          eyebrow="עמלה"
          title={TERMS.commission.title}
          align="start"
          className="mb-6"
        />
        <p className="text-lg text-ink-700 leading-relaxed mb-8">
          {TERMS.commission.body}
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {TERMS.commission.stages.map((stage, idx) => (
            <Card key={idx} className="p-6 text-center">
              <div className="mb-3 flex items-center justify-center">
                <span className="flex items-center justify-center h-9 w-9 rounded-full bg-navy-600 text-white font-bold">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-display text-ink-900 font-bold text-lg mb-1.5">
                {stage.label}
              </h3>
              <p className="text-ink-700 text-sm leading-relaxed">
                {stage.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ======== ערבות שלושה חודשים ======== */}
      <section className="bg-sand-50 py-16 px-4 border-y border-sand-200">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="ערבות"
            title={TERMS.guarantee.title}
            align="start"
            className="mb-6"
          />
          <p className="text-lg text-ink-700 leading-relaxed">
            {TERMS.guarantee.body}
          </p>
        </div>
      </section>

      {/* ======== מה גלוי ומה פנימי ======== */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <SectionHeading
          eyebrow="פרטיות"
          title={TERMS.visibility.title}
          align="start"
          className="mb-6"
        />
        <p className="text-lg text-ink-700 leading-relaxed mb-8">
          {TERMS.visibility.body}
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 border-r-4 border-r-olive-500">
            <h3 className="font-display text-ink-900 text-xl font-bold mb-4">
              {TERMS.visibility.public.label}
            </h3>
            <ul className="space-y-3">
              {TERMS.visibility.public.items.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-ink-700">
                  <span className="text-olive-600 shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-8 border-r-4 border-r-navy-600">
            <h3 className="font-display text-ink-900 text-xl font-bold mb-4">
              {TERMS.visibility.internal.label}
            </h3>
            <ul className="space-y-3">
              {TERMS.visibility.internal.items.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-ink-700">
                  <span className="text-navy-600 shrink-0" aria-hidden="true">
                    •
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ======== דיסקרטיות + CTA ======== */}
      <section className="bg-navy-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            {TERMS.discretion.title}
          </h2>
          <p className="text-sand-200 text-lg leading-relaxed mb-8">
            {TERMS.discretion.body}
          </p>
          <Link
            href="/employers/contact"
            className="inline-block bg-white hover:bg-sand-100 text-navy-700 font-bold text-lg px-8 py-3.5 rounded-xl transition-colors duration-150 text-center"
          >
            {SITE_CONTENT.employers.hero.buttonPrimary}
          </Link>
        </div>
      </section>
    </main>
  );
}
