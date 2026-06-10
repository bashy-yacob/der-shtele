import Link from 'next/link';
import { SITE_CONTENT } from '@/lib/constants';

export default function HomePage() {
  return (
    <main>
      {/* ======== HERO ======== */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-700 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">{SITE_CONTENT.hero.title}</h1>
        <p className="text-2xl font-semibold mb-6 text-primary-100">{SITE_CONTENT.hero.tagline}</p>
        <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          {SITE_CONTENT.hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="bg-white text-primary-600 font-bold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors shadow-lg"
          >
            {SITE_CONTENT.hero.buttonPrimary}
          </Link>
          <Link
            href="/jobs"
            className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {SITE_CONTENT.hero.buttonSecondary}
          </Link>
        </div>
      </section>

      {/* ======== STEPS ======== */}
      <section className="bg-neutral-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{SITE_CONTENT.steps.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {SITE_CONTENT.steps.list.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-lg shadow-md border-t-4 border-primary-600 text-center"
              >
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== STATS ======== */}
      <section className="bg-white border-y border-neutral-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{SITE_CONTENT.stats.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {SITE_CONTENT.stats.list.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                <p className="text-neutral-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRUST BAR ======== */}
      <section className="bg-primary-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center font-bold text-lg text-primary-900 mb-6">{SITE_CONTENT.trust.title}</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-neutral-700">
            {SITE_CONTENT.trust.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-primary-600 font-bold">·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="bg-neutral-50 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">מוכנים להשתנות?</h2>
          <p className="text-neutral-600 mb-8">
            הגישו קורות חיים וצוות שלנו יטפל בחיפוש המשרה המתאימה בעבורכם
          </p>
          <Link href="/contact" className="btn-primary">
            התחילו עכשיו
          </Link>
        </div>
      </section>
    </main>
  );
}
