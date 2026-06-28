"use client";

import { useState } from "react";
import { useAdSlot, normalizeUrl } from "./useAdSlot";

/**
 * פופאפ חסות במרכז המסך — הפורמט הבולט ביותר, מקום לתמונה גדולה וקריאה.
 * מוצג פעם אחת ל-session (נסגר ולא חוזר). placement=jobs_list.
 * כלל ברזל: ללא תמונות אנשים; מסומן "מודעה"; סגירה קלה (X / לחיצה על הרקע).
 */
export function AdPopup() {
  const { ad, dismissed, hidden, close } = useAdSlot(
    "jobs_list",
    "ds_ad_popup_dismissed",
  );
  const [imgFailed, setImgFailed] = useState(false);

  if (hidden || dismissed || !ad) return null;
  const showImage = Boolean(ad.imageUrl) && !imgFailed;

  return (
    <div
      dir="rtl"
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="מודעה"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-2xl border-t-4 border-t-olive-500 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="סגירת המודעה"
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-ink-500 hover:bg-sand-200"
        >
          ✕
        </button>

        <div className="p-6 pt-9">
          <span className="text-xs font-bold uppercase tracking-wide text-olive-700">
            מודעה
          </span>

          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.imageUrl as string}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="mt-3 max-h-72 w-full rounded-xl bg-sand-50 object-contain"
            />
          )}

          <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-ink-900">
            {ad.title}
          </h3>
          {ad.body && (
            <p className="mt-2 text-base leading-relaxed text-ink-700">
              {ad.body}
            </p>
          )}

          {ad.linkUrl && (
            <a
              href={normalizeUrl(ad.linkUrl)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="mt-5 block w-full rounded-xl bg-navy-600 px-4 py-3 text-center font-bold text-white hover:bg-navy-700"
            >
              למידע נוסף ←
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
