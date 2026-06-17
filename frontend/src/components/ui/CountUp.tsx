"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** הערך הסופי שאליו סופרים. */
  to: number;
  /** משך הספירה במ"ש. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * מונה עולה שמתחיל כשהמספר נכנס לתצוגה. עדין — ספירה אחת, ללא לולאה.
 * מי שביקש prefers-reduced-motion יראה מיד את הערך הסופי (globals.css מאפס משך).
 */
export function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (reduce) {
          setValue(to);
          io.disconnect();
          return;
        }

        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out
          setValue(Math.round(eased * to));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
