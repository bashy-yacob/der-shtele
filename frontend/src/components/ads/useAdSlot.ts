"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { PublicAd } from "@/types";

// עמודים שבהם פרסום לא מוצג — אזורים אישיים/ניהוליים (לא "ציבורי").
const HIDDEN_PREFIXES = [
  "/admin",
  "/portal",
  "/account",
  "/login",
  "/register",
  "/auth",
];

/** משלים פרוטוקול חסר כדי שקישור "www.example.com" יפעל כקישור חיצוני. */
export function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Hook משותף לסלוטי פרסום — שולף מודעות לעמוד ציבורי בצד-לקוח (לא חוסם
 * cold-start) ומסתיר באזורים לא-ציבוריים. לוגיקת הצגה/סגירה נשארת ברכיב,
 * כדי שכל פורמט יוכל לקבוע תדירות משלו (באנר=פעם לביקור, פופאפ=כל כמה עמודים).
 */
export function useAdSlot(placement: string) {
  const pathname = usePathname();
  const [ads, setAds] = useState<PublicAd[]>([]);

  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  useEffect(() => {
    if (hidden) return;
    let active = true;
    fetch(`/api/public/ads?placement=${encodeURIComponent(placement)}`)
      .then((r) => r.json())
      .then((j) => {
        if (active && j?.success && Array.isArray(j.data)) setAds(j.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [hidden, placement]);

  // המודעה בעדיפות העליונה (order נמוך) — או null אם אין.
  return { ad: ads[0] ?? null, hidden, pathname };
}
