// import Link from 'next/link';
// import { SITE_CONTENT } from '@/lib/constants';

// export default function HomePage() {
//   return (
//     <main>
//       {/* ======== HERO ======== */}
//       <section className="bg-gradient-to-b from-primary-600 to-primary-700 text-white py-20 px-4 text-center">
//         <h1 className="text-5xl font-bold mb-4">{SITE_CONTENT.hero.title}</h1>
//         <p className="text-2xl font-semibold mb-6 text-primary-100">{SITE_CONTENT.hero.tagline}</p>
//         <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
//           {SITE_CONTENT.hero.subtitle}
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <Link
//             href="/contact"
//             className="bg-white text-primary-600 font-bold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors shadow-lg"
//           >
//             {SITE_CONTENT.hero.buttonPrimary}
//           </Link>
//           <Link
//             href="/jobs"
//             className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors"
//           >
//             {SITE_CONTENT.hero.buttonSecondary}
//           </Link>
//         </div>
//       </section>

//       {/* ======== STEPS ======== */}
//       <section className="bg-neutral-50 py-16 px-4">
//         <div className="max-w-5xl mx-auto">
//           <h2 className="text-4xl font-bold text-center mb-12">{SITE_CONTENT.steps.title}</h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             {SITE_CONTENT.steps.list.map((step, idx) => (
//               <div
//                 key={idx}
//                 className="bg-white p-8 rounded-lg shadow-md border-t-4 border-primary-600 text-center"
//               >
//                 <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
//                   {idx + 1}
//                 </div>
//                 <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
//                 <p className="text-neutral-600 leading-relaxed">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ======== STATS ======== */}
//       <section className="bg-white border-y border-neutral-200 py-12 px-4">
//         <div className="max-w-5xl mx-auto">
//           <h2 className="text-3xl font-bold text-center mb-10">{SITE_CONTENT.stats.title}</h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             {SITE_CONTENT.stats.list.map((stat, idx) => (
//               <div key={idx} className="text-center">
//                 <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
//                 <p className="text-neutral-600 font-medium">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ======== TRUST BAR ======== */}
//       <section className="bg-primary-50 py-12 px-4">
//         <div className="max-w-5xl mx-auto">
//           <h3 className="text-center font-bold text-lg text-primary-900 mb-6">{SITE_CONTENT.trust.title}</h3>
//           <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-neutral-700">
//             {SITE_CONTENT.trust.items.map((item, idx) => (
//               <div key={idx} className="flex items-center gap-2">
//                 <span className="text-primary-600 font-bold">·</span>
//                 <span>{item}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ======== CTA ======== */}
//       <section className="bg-neutral-50 py-16 px-4 text-center">
//         <div className="max-w-2xl mx-auto">
//           <h2 className="text-3xl font-bold mb-6">מוכנים להשתנות?</h2>
//           <p className="text-neutral-600 mb-8">
//             הגישו קורות חיים וצוות שלנו יטפל בחיפוש המשרה המתאימה בעבורכם
//           </p>
//           <Link href="/contact" className="btn-primary">
//             התחילו עכשיו
//           </Link>
//         </div>
//       </section>
//     </main>
//   );
// }
import Link from 'next/link';

// ריכוז הטקסטים החדשים לנוחות תחזוקה ובנייה בטוחה ללא שגיאות ייבוא
const CONTENT = {
  hero: {
    title: "דער שטעלע — מוצאים לך את המשרה הנכונה",
    subtitle: "סוכנות השמה מקצועית לציבור החרדי בישראל. אנחנו מטפלים בכל הפרטים — אתם מתמקדים בעבודה.",
    buttonPrimary: "שלח קורות חיים עכשיו ←",
    buttonSecondary: "צפה במשרות הפתוחות"
  },
  steps: {
    title: "איך זה עובד — שלושה שלבים",
    list: [
      {
        title: "שלחו קורות חיים",
        desc: "ממלאים טופס קצר ומעלים קורות חיים באתר בקלות ובמהירות."
      },
      {
        title: "אנחנו עושים את העבודה",
        desc: "הצוות המקצועי שלנו עובר על הפרטים, מסנן ומציג אתכם למעסיקים המתאימים ביותר."
      },
      {
        title: "מתאים? נחזור אליכם",
        desc: "נציג מטעמנו יחזור אליכם עם הצעה קונקרטית, ממוקדת ומותאמת עבורכם."
      }
    ]
  },
  stats: {
    title: "השירות שלנו במספרים",
    list: [
      {
        value: "משרות פעילות",
        label: "מגוון משרות איכותיות המתעדכנות באופן שוטף"
      },
      {
        value: "גיוסים מוצלחים",
        label: "אחוזי השמה גבוהים וליווי אישי לאורך כל התהליך"
      },
      {
        value: "פעילים בכל הגדולות",
        label: "בני ברק, ירושלים, אלעד, מודיעין עילית, ביתר עילית ועוד"
      }
    ]
  },
  trust: {
    title: "הסטנדרטים שלנו",
    items: [
      "סוכנות השמה מקצועית",
      "שמירה על צניעות ופרטיות",
      "ללא גישה ישירה של מעסיקים למועמדים",
      "ללא פרסומות"
    ]
  }
};

export default function HomePage() {
  return (
    <main className="text-right" dir="rtl">
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-24 px-4 text-center">
        {/* אלמנט עיצובי רקע עדין */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative max-w-4xl mx-auto z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {CONTENT.hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-primary-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {CONTENT.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/10 text-center"
            >
              {CONTENT.hero.buttonPrimary}
            </Link>
            <Link
              href="/jobs"
              className="w-full sm:w-auto border-2 border-white/80 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
            >
              {CONTENT.hero.buttonSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ======== STEPS (כרטיסים אופקיים עם אייקונים) ======== */}
      <section className="bg-neutral-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-neutral-900 mb-16 tracking-tight">
            {CONTENT.steps.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {CONTENT.steps.list.map((step, idx) => (
              <div
                key={idx}
                className="group relative flex flex-row items-start gap-4 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-neutral-100 hover:-translate-y-1 transition-all duration-300"
              >
                {/* קו עליון דקורטיבי */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500 rounded-t-2xl group-hover:h-1.5 transition-all" />
                
                {/* אייקונים מותאמים לכל שלב */}
                <div className="bg-primary-50 text-primary-600 p-3 rounded-xl shrink-0">
                  {idx === 0 && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-neutral-800 mb-1">{step.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== STATS (מותאם ללא מספרים) ======== */}
      <section className="bg-white border-y border-neutral-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-x-reverse md:divide-neutral-100">
            {CONTENT.stats.list.map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-neutral-500 font-medium text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRUST BAR (פס אמון) ======== */}
      <section className="bg-primary-50/60 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center font-bold text-sm sm:text-base text-primary-900 uppercase tracking-wider mb-6">
            {CONTENT.trust.title}
          </h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm sm:text-base text-neutral-700 font-medium">
            {CONTENT.trust.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-primary-100/50 shadow-sm">
                <svg
                  className="w-5 h-5 text-primary-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-3xl p-8 sm:p-12 border border-neutral-200/60 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">מוכנים להשתנות?</h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
            הגישו קורות חיים והצוות שלנו יטפל בחיפוש המשרה המתאימה ביותר עבורכם.
          </p>
          <div className="inline-block">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary-600/15"
            >
              התחילו עכשיו
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}