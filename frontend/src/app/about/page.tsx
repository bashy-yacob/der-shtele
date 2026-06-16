import type { Metadata } from "next";
import { SITE_CONTENT } from "@/lib/constants";
import { Card, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "אודות" };

export default function AboutPage() {
  return (
    <main dir="rtl">
      {/* Hero Section */}
      <section className="bg-sand-100 py-16 px-4 border-b border-sand-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-ink-900 text-4xl sm:text-5xl font-bold mb-4">
            {SITE_CONTENT.about.title}
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 leading-relaxed">
            {SITE_CONTENT.about.subtitle}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <SectionHeading
          eyebrow="מי אנחנו"
          title="הסיפור שלנו"
          align="start"
          className="mb-6"
        />
        <p className="text-lg text-ink-700 leading-relaxed">
          {SITE_CONTENT.about.story}
        </p>
      </section>

      {/* Values */}
      <section className="bg-sand-50 py-16 px-4 border-y border-sand-200">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="העקרונות שלנו"
            title="ערכי הסוכנות"
            align="center"
            className="mb-12"
          />
          <div className="grid md:grid-cols-2 gap-8">
            {SITE_CONTENT.about.values.map((value, idx) => (
              <Card key={idx} className="p-8 border-r-4 border-r-olive-500">
                <h3 className="font-display text-ink-900 text-xl font-bold mb-3">
                  {value.title}
                </h3>
                <p className="text-ink-700 leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <SectionHeading
          eyebrow="התהליך"
          title="איך עובדים עם אנחנו — מצד המועמד"
          align="start"
          className="mb-8"
        />
        <ol className="space-y-6">
          {[
            {
              step: 1,
              title: "שלחו קורות חיים",
              desc: "דרך האתר עם פרטיכם ותחום עיסוק מועדף",
            },
            {
              step: 2,
              title: "צוות עובר על הפנייה",
              desc: "בודקים התאמה למשרות קיימות וביודו",
            },
            {
              step: 3,
              title: "שיחת היכרות",
              desc: "אם צריך, עובד יוצר קשר טלפוני להבנת צרכים",
            },
            {
              step: 4,
              title: "הצגה למעסיק",
              desc: "מתאים להציג ללקוח — רק לאחר הסכמה",
            },
            {
              step: 5,
              title: "גיוס מוצלח",
              desc: "מלווה עד לסגירה ועמלה משפחתית",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-navy-600 text-white font-bold">
                  {item.step}
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
    </main>
  );
}
