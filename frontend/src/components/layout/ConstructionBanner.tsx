import { CONTACT_INFO } from "@/lib/constants";

// באנר זמני "האתר בבנייה" — להציג עד שהאתר מוכן, ואז למחוק את הרכיב.
// רכיב שרת סטטי בכוונה: ללא state/effect, כך שאין flash ואינו נעלם.
export function ConstructionBanner() {
  return (
    <div dir="rtl" role="status" className="bg-olive-500 text-sand-50 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col items-center justify-center gap-1 text-center">
        <p className="font-medium flex items-center justify-center gap-2">
          <span aria-hidden className="text-base leading-none">
            🚧
          </span>
          האתר נמצא בשלבי בנייה — ייתכנו עדכונים ושינויים. תודה על הסבלנות!
        </p>
        <p className="text-xs text-sand-50/90">
          נתקלתם בתקלה או יש לכם רעיון לשיפור? נשמח לשמוע ב־
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="font-medium underline underline-offset-2 hover:text-white"
          >
            {CONTACT_INFO.email}
          </a>
        </p>
      </div>
    </div>
  );
}
