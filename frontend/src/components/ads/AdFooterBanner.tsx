"use client";

import { useEffect, useState } from "react";
import { useAdSlot, normalizeUrl } from "./useAdSlot";

/**
 * רצועת חסות אופקית מעל ה-Footer. בזרימת העמוד (לא צפה) — לא חוסמת תוכן.
 * כותרת + טקסט תמיד קריאים (לא תלוי בתמונה). placement=footer.
 * מוצגת רק בעמודים ציבוריים (useAdSlot מסתיר באזורים אישיים/ניהוליים).
 * נסגרת פעם אחת לביקור (session).
 */
export function AdFooterBanner() {
  const { ad, hidden } = useAdSlot("footer");
  const [dismissed, setDismissed] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (hidden) return;
    try {
      if (sessionStorage.getItem("ds_ad_footer_dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    setDismissed(false);
  }, [hidden]);

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("ds_ad_footer_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (hidden || dismissed || !ad) return null;
  const showImage = Boolean(ad.imageUrl) && !imgFailed;

  return (
    <div dir="rtl" className="border-t-4 border-t-olive-500 bg-sand-50">
      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-4 pe-12 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="button"
          onClick={close}
          aria-label="סגירת המודעה"
          className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-ink-500 hover:bg-sand-200"
        >
          ✕
        </button>

        {showImage ? (
          // מודעה מונפשת: GIF / WebP מונפש מתנגן אוטומטית בתוך <img> — בלי נגן וידאו.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.imageUrl as string}
            alt={ad.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-16 w-28 shrink-0 rounded-xl bg-white object-contain"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wide text-olive-700">
            מודעה
          </span>
          <h3 className="mt-0.5 font-display text-lg font-bold leading-snug text-ink-900">
            {ad.title}
          </h3>
          {ad.body && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-700">
              {ad.body}
            </p>
          )}
        </div>

        {ad.linkUrl && (
          <a
            href={normalizeUrl(ad.linkUrl)}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="shrink-0 rounded-xl bg-navy-600 px-5 py-2.5 text-center font-bold text-white hover:bg-navy-700"
          >
            למידע נוסף ←
          </a>
        )}
      </div>
    </div>
  );
}
