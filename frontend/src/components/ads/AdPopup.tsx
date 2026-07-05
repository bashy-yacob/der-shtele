"use client";

import { useEffect, useState } from "react";
import { useAdSlot, normalizeUrl } from "./useAdSlot";

// מציגים את הפופאפ פעם בכל כמה עמודים (לא בכל מעבר) כדי לא להציק.
const SHOW_EVERY_PAGES = 3;

/**
 * פופאפ חסות במרכז המסך — הפורמט הגדול והבולט ביותר, מקום לתמונה גדולה וקריאה.
 * מופיע פעם בכל ~3 עמודים לאותו גולש (נספר ב-session). placement=jobs_list.
 * כלל ברזל: ללא תמונות אנשים; מסומן "מודעה"; סגירה קלה (X / לחיצה על הרקע).
 */
export function AdPopup() {
  const { ad, hidden, pathname } = useAdSlot("jobs_list");
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // ספירת עמודים לכל ביקור — מציג כשעברו לפחות SHOW_EVERY_PAGES מאז ההצגה האחרונה.
  useEffect(() => {
    if (hidden) {
      setOpen(false);
      return;
    }
    try {
      const pv = Number(sessionStorage.getItem("ds_popup_pv") ?? "0") + 1;
      sessionStorage.setItem("ds_popup_pv", String(pv));
      const seenRaw = sessionStorage.getItem("ds_popup_seen");
      const seenAt = seenRaw === null ? null : Number(seenRaw);
      if (seenAt === null || pv - seenAt >= SHOW_EVERY_PAGES) {
        sessionStorage.setItem("ds_popup_seen", String(pv));
        setOpen(true);
      } else {
        setOpen(false);
      }
    } catch {
      setOpen(true); // אין storage — מציגים
    }
  }, [pathname, hidden]);

  if (hidden || !open || !ad) return null;
  const showImage = Boolean(ad.imageUrl) && !imgFailed;
  const close = () => setOpen(false);

  return (
    <div
      dir="rtl"
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="מודעה"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative w-full max-w-xl overflow-hidden rounded-2xl border-t-8 border-t-olive-500 bg-white shadow-lift"
      >
        <button
          type="button"
          onClick={close}
          aria-label="סגירת המודעה"
          className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-lg text-ink-500 hover:bg-sand-200"
        >
          ✕
        </button>

        <div className="p-8 pt-12">
          <span className="text-sm font-bold uppercase tracking-wide text-olive-700">
            מודעה
          </span>

          {showImage && (
            // מודעה מונפשת: GIF / WebP מונפש מתנגן אוטומטית בתוך <img> — בלי נגן וידאו.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.imageUrl as string}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="mt-4 max-h-96 w-full rounded-2xl bg-sand-50 object-contain"
            />
          )}

          <h3 className="mt-5 font-display text-3xl font-bold leading-tight text-ink-900">
            {ad.title}
          </h3>
          {ad.body && (
            <p className="mt-3 text-lg leading-relaxed text-ink-700">
              {ad.body}
            </p>
          )}

          {ad.linkUrl && (
            <a
              href={normalizeUrl(ad.linkUrl)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="mt-6 block w-full rounded-xl bg-navy-600 px-5 py-4 text-center text-lg font-bold text-white hover:bg-navy-700"
            >
              למידע נוסף ←
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
