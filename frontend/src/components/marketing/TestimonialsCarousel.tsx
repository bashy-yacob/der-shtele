"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicTestimonial } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  items: PublicTestimonial[];
  /** מרווח החלפה אוטומטית במ"ש (0 = ללא החלפה אוטומטית). */
  intervalMs?: number;
}

/**
 * קרוסלת המלצות — מחליפה המלצה אחת בכל פעם, בעדינות (fade).
 * כללי תרבות: בלי תמונות אנשים, בלי אנימציות פולשניות.
 * נגישות: מכבד prefers-reduced-motion (ללא החלפה אוטומטית), עוצר בריחוף/פוקוס,
 * וניתן לניווט במקלדת. RTL — חץ "הקודם" מימין ו"הבא" משמאל.
 */
export function TestimonialsCarousel({ items, intervalMs = 7000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const go = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );

  // החלפה אוטומטית — מושבתת כשיש המלצה אחת, בריחוף, או בהעדפת תנועה מופחתת.
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (count <= 1 || paused || reducedMotion || intervalMs <= 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, paused, reducedMotion, intervalMs]);

  if (count === 0) return null;

  const active = items[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="המלצות לקוחות"
    >
      {/* כרטיס ההמלצה */}
      <div
        aria-live="polite"
        className="bg-white border border-sand-200 rounded-3xl shadow-soft px-7 py-10 sm:px-12 sm:py-12 text-center min-h-[16rem] flex flex-col items-center justify-center"
      >
        {/* גרש פתיחה דקורטיבי (לא תמונת אדם) */}
        <span
          aria-hidden="true"
          className="font-display text-olive-300 text-6xl leading-none mb-2 select-none"
        >
          &rdquo;
        </span>

        <blockquote
          key={active.id}
          className="animate-fade-up text-ink-800 text-lg sm:text-2xl leading-relaxed font-display max-w-2xl mx-auto"
        >
          {active.quote}
        </blockquote>

        <figcaption className="mt-6">
          <p className="font-bold text-ink-900">{active.authorName}</p>
          {active.authorRole && (
            <p className="text-sm text-ink-500 mt-0.5">{active.authorRole}</p>
          )}
        </figcaption>
      </div>

      {/* פקדי ניווט — מוצגים רק כשיש יותר מהמלצה אחת */}
      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="ההמלצה הקודמת"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-sand-300 text-ink-500 hover:text-navy-600 hover:border-navy-300 transition-colors"
          >
            {/* RTL: "הקודם" = חץ ימינה */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* נקודות מצב */}
          <div className="flex items-center gap-2">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`המלצה ${i + 1} מתוך ${count}`}
                aria-current={i === index}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-navy-600"
                    : "w-2.5 bg-sand-300 hover:bg-sand-400",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="ההמלצה הבאה"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-sand-300 text-ink-500 hover:text-navy-600 hover:border-navy-300 transition-colors"
          >
            {/* RTL: "הבא" = חץ שמאלה */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/** מחזיר true אם המשתמש ביקש תנועה מופחתת — להשבתת ההחלפה האוטומטית. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const mqRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqRef.current = mq;
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
