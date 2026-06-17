// באנר זמני "האתר בבנייה" — להציג עד שהאתר מוכן, ואז למחוק את הרכיב.
// רכיב שרת סטטי בכוונה: ללא state/effect, כך שאין flash ואינו נעלם.
export function ConstructionBanner() {
  return (
    <div dir="rtl" role="status" className="bg-olive-500 text-sand-50 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <span aria-hidden className="text-base leading-none">
          🚧
        </span>
        <p className="font-medium">
          האתר נמצא בשלבי בנייה — ייתכנו עדכונים ושינויים. תודה על הסבלנות!
        </p>
      </div>
    </div>
  );
}
