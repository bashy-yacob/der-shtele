"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** השהיה במ"ש לפני התחלת האנימציה — לאפקט מדורג (stagger). */
  delay?: number;
  className?: string;
}

/**
 * עוטף תוכן בחשיפה עדינה (fade-up) כשהוא נכנס לתצוגה.
 * משתמש ב-IntersectionObserver; מכבד prefers-reduced-motion דרך globals.css.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(shown ? "animate-fade-up" : "opacity-0", className)}
    >
      {children}
    </div>
  );
}
