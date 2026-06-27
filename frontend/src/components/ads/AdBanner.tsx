"use client";

import { useState } from "react";
import type { PublicAd } from "@/types";

// משלים פרוטוקול חסר כדי שקישור "www.example.com" יפעל כקישור חיצוני.
function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * באנר מודעת חסות — צנוע, מסומן "מודעה". ללא תמונות אנשים (נאכף ע"י אישור הצוות).
 * אם התמונה נכשלת בטעינה (למשל חסימת NetFree) — מתדרדר לטקסט בלבד.
 */
export function AdBanner({ ad }: { ad: PublicAd }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(ad.imageUrl) && !imgFailed;

  const inner = (
    <div className="relative flex items-center gap-4 bg-white border border-sand-200 rounded-2xl shadow-soft p-4 hover:border-olive-300 transition-colors">
      <span className="absolute top-2 start-3 text-[11px] text-ink-400 font-semibold">
        מודעה
      </span>
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.imageUrl as string}
          alt={ad.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-16 w-16 shrink-0 rounded-xl bg-sand-50 object-contain"
        />
      )}
      <div className="min-w-0 pt-3">
        <h3 className="truncate font-display font-bold text-ink-900">
          {ad.title}
        </h3>
        {ad.body && (
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-600">{ad.body}</p>
        )}
      </div>
    </div>
  );

  if (ad.linkUrl) {
    return (
      <a
        href={normalizeUrl(ad.linkUrl)}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
