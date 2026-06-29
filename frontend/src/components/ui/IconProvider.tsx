"use client";

import { IconContext } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * ברירת מחדל גלובלית לכל אייקוני Phosphor באתר:
 * - weight="duotone" — קונספט האייקונים של דער שטעלע (קו + מילוי רך בגוון בהיר).
 * - הצבע יורש מ-currentColor (text-navy-600 / text-olive-600 וכו') דרך מחלקות Tailwind.
 * - aria-hidden — האייקונים דקורטיביים; טקסט נגיש ניתן ליד הכפתור/הקישור עצמו.
 *
 * אפשר לעקוף נקודתית בכל אייקון: <Icon weight="bold" /> או aria-hidden={false}.
 */
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider
      value={{
        weight: "duotone",
        "aria-hidden": true,
      }}
    >
      {children}
    </IconContext.Provider>
  );
}
