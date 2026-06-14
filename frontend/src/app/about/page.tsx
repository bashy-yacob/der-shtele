import type { Metadata } from 'next';
import { SITE_CONTENT } from '@/lib/constants';

export const metadata: Metadata = { title: 'אודות' };

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-primary-50 py-12 px-4 border-b border-primary-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">{SITE_CONTENT.about.title}</h1>
          <p className="text-xl text-neutral-600">{SITE_CONTENT.about.subtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold mb-6">הסיפור שלנו</h2>
        <p className="text-lg text-neutral-700 leading-relaxed mb-6">
          {SITE_CONTENT.about.story}
        </p>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">ערכי הסוכנות</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {SITE_CONTENT.about.values.map((value, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-lg shadow-md border-r-4 border-primary-600"
              >
                <h3 className="text-xl font-bold text-primary-600 mb-3">{value.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold mb-8">איך עובדים עם אנחנו — מצד המועמד</h2>
        <ol className="space-y-6">
          {[
            { step: 1, title: 'שלחו קורות חיים', desc: 'דרך האתר עם פרטיכם ותחום עיסוק מועדף' },
            { step: 2, title: 'צוות עובר על הפנייה', desc: 'בודקים התאמה למשרות קיימות וביודו' },
            { step: 3, title: 'שיחת היכרות', desc: 'אם צריך, עובד יוצר קשר טלפוני להבנת צרכים' },
            { step: 4, title: 'הצגה למעסיק', desc: 'מתאים להציג ללקוח — רק לאחר הסכמה' },
            { step: 5, title: 'גיוס מוצלח', desc: 'מלווה עד לסגירה ועמלה משפחתית' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white font-bold">
                  {item.step}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-neutral-600 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </ol>
      </section>
    </main>
  );
}
