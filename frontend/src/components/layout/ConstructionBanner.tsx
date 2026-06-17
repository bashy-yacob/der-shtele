"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "construction-banner-dismissed";

export function ConstructionBanner() {
  const [dismissed, setDismissed] = useState(true);

  // נטען רק בצד הלקוח כדי לכבד את בחירת הגולש (sessionStorage)
  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div dir="rtl" role="status" className="bg-olive-500 text-sand-50 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <span aria-hidden className="text-base leading-none">
          🚧
        </span>
        <p className="font-medium">
          האתר נמצא בשלבי בנייה — ייתכנו עדכונים ושינויים. תודה על הסבלנות!
        </p>
        <button
          type="button"
          aria-label="סגירת ההודעה"
          onClick={() => {
            sessionStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
          className="mr-1 shrink-0 rounded-full w-6 h-6 flex items-center justify-center text-sand-50/80 hover:text-sand-50 hover:bg-olive-600 transition-colors"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
