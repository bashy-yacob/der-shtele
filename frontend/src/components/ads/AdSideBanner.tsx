"use client";

import { useEffect, useState } from "react";
import { useAdSlot, normalizeUrl } from "./useAdSlot";

/**
 * באנר חסות קבוע וגדול — דבוק לצד שמאל במסך רחב, רצועה תחתונה במובייל.
 * כותרת + טקסט תמיד מוצגים כטקסט קריא (לא תלוי בתמונה). placement=homepage.
 * נסגר פעם אחת לביקור (session).
 */
export function AdSideBanner() {
  const { ad, hidden } = useAdSlot("homepage");
  const [dismissed, setDismissed] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (hidden) return;
    try {
      if (sessionStorage.getItem("ds_ad_side_dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    setDismissed(false);
  }, [hidden]);

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("ds_ad_side_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (hidden || dismissed || !ad) return null;
  const showImage = Boolean(ad.imageUrl) && !imgFailed;

  const label = (
    <span className="text-xs font-bold uppercase tracking-wide text-olive-700">
      מודעה
    </span>
  );

  const closeBtn = (
    <button
      type="button"
      onClick={close}
      aria-label="סגירת המודעה"
      className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-ink-500 hover:bg-sand-200"
    >
      ✕
    </button>
  );

  const img = (cls: string) =>
    showImage ? (
      // מודעה מונפשת: GIF / WebP מונפש מתנגן אוטומטית בתוך <img> — בלי נגן וידאו.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ad.imageUrl as string}
        alt={ad.title}
        loading="lazy"
        onError={() => setImgFailed(true)}
        className={cls}
      />
    ) : null;

  return (
    <>
      {/* מסך רחב — באנר צד גדול, דבוק לשמאל, ממורכז אנכית */}
      <aside
        dir="rtl"
        className="fixed left-4 top-1/2 z-40 hidden w-80 -translate-y-1/2 lg:block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-sand-200 border-t-4 border-t-olive-500 bg-white shadow-lift">
          {closeBtn}
          <div className="p-5 pt-8">
            <div className="mb-2">{label}</div>
            {img("mb-3 w-full rounded-xl bg-sand-50 object-contain")}
            <h3 className="font-display text-xl font-bold leading-snug text-ink-900">
              {ad.title}
            </h3>
            {ad.body && (
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {ad.body}
              </p>
            )}
            {ad.linkUrl && (
              <a
                href={normalizeUrl(ad.linkUrl)}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="mt-4 block w-full rounded-xl bg-navy-600 px-4 py-2.5 text-center font-bold text-white hover:bg-navy-700"
              >
                למידע נוסף ←
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* מסך צר — רצועה תחתונה גדולה */}
      <div dir="rtl" className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
        <div className="relative mx-auto flex max-w-2xl items-center gap-4 rounded-2xl border border-sand-200 border-t-4 border-t-olive-500 bg-white p-4 pe-10 shadow-lift">
          {closeBtn}
          {img("h-16 w-16 shrink-0 rounded-xl bg-sand-50 object-contain")}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5">{label}</div>
            <h3 className="truncate font-display text-base font-bold text-ink-900">
              {ad.title}
            </h3>
            {ad.body && (
              <p className="line-clamp-2 text-sm text-ink-700">{ad.body}</p>
            )}
          </div>
          {ad.linkUrl && (
            <a
              href={normalizeUrl(ad.linkUrl)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="shrink-0 rounded-xl bg-navy-600 px-4 py-2 text-sm font-bold text-white hover:bg-navy-700"
            >
              למידע ←
            </a>
          )}
        </div>
      </div>
    </>
  );
}
