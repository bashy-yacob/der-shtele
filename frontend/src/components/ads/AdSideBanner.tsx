"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { PublicAd } from "@/types";

// עמודים שבהם הבאנר לא מוצג — אזורים אישיים/ניהוליים (לא "ציבורי").
const HIDDEN_PREFIXES = [
  "/admin",
  "/portal",
  "/account",
  "/login",
  "/register",
  "/auth",
];

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * באנר חסות קבוע — דבוק לצד שמאל במסך רחב, רצועה תחתונה במובייל. נטען בצד-לקוח
 * (לא חוסם טעינת עמוד גם כש-Render במצב cold-start). ניתן לסגירה (נזכר ב-session).
 * כלל ברזל: ללא תמונות אנשים; מסומן "מודעה".
 */
export function AdSideBanner() {
  const pathname = usePathname();
  const [ads, setAds] = useState<PublicAd[]>([]);
  const [dismissed, setDismissed] = useState(true); // ברירת מחדל סגור עד שנדע
  const [imgFailed, setImgFailed] = useState(false);

  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // שחזור מצב סגירה (פעם אחת ל-session) + טעינת מודעות לעמוד ציבורי.
  useEffect(() => {
    if (hidden) return;
    let active = true;

    try {
      if (sessionStorage.getItem("ds_ad_dismissed") === "1") return;
    } catch {
      /* sessionStorage חסום — ממשיכים */
    }
    setDismissed(false);

    fetch("/api/public/ads?placement=homepage")
      .then((r) => r.json())
      .then((j) => {
        if (active && j?.success && Array.isArray(j.data)) setAds(j.data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [hidden, pathname]);

  if (hidden || dismissed || ads.length === 0) return null;

  const ad = ads[0]; // המודעה בעדיפות העליונה (order נמוך)
  const showImage = Boolean(ad.imageUrl) && !imgFailed;

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("ds_ad_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  const label = (
    <span className="text-[11px] font-semibold text-ink-400">מודעה</span>
  );

  const closeBtn = (
    <button
      type="button"
      onClick={close}
      aria-label="סגירת המודעה"
      className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-ink-500 hover:bg-sand-200"
    >
      ✕
    </button>
  );

  const image = showImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.imageUrl as string}
      alt={ad.title}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="w-full rounded-lg bg-sand-50 object-contain"
    />
  ) : null;

  const cta = ad.linkUrl ? (
    <a
      href={normalizeUrl(ad.linkUrl)}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="mt-2 inline-block w-full rounded-lg bg-navy-600 px-3 py-1.5 text-center text-sm font-bold text-white hover:bg-navy-700"
    >
      למידע נוסף ←
    </a>
  ) : null;

  return (
    <>
      {/* מסך רחב — דבוק לצד שמאל, ממורכז אנכית */}
      <aside
        dir="rtl"
        className="fixed left-3 top-1/2 z-40 hidden w-48 -translate-y-1/2 md:block"
      >
        <div className="relative rounded-2xl border border-sand-200 bg-white p-3 pt-7 shadow-lift">
          {closeBtn}
          <div className="absolute right-3 top-2">{label}</div>
          {image}
          <h3 className="mt-2 font-display text-base font-bold leading-tight text-ink-900">
            {ad.title}
          </h3>
          {ad.body && (
            <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-ink-600">
              {ad.body}
            </p>
          )}
          {cta}
        </div>
      </aside>

      {/* מובייל — רצועה תחתונה */}
      <div dir="rtl" className="fixed inset-x-0 bottom-0 z-40 p-2 md:hidden">
        <div className="relative flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-3 pe-9 shadow-lift">
          {closeBtn}
          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.imageUrl as string}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-12 w-12 shrink-0 rounded-lg bg-sand-50 object-contain"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {label}
              <h3 className="truncate font-display text-sm font-bold text-ink-900">
                {ad.title}
              </h3>
            </div>
            {ad.body && (
              <p className="truncate text-xs text-ink-600">{ad.body}</p>
            )}
          </div>
          {ad.linkUrl && (
            <a
              href={normalizeUrl(ad.linkUrl)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="shrink-0 rounded-lg bg-navy-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-700"
            >
              למידע ←
            </a>
          )}
        </div>
      </div>
    </>
  );
}
