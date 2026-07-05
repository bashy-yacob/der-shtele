"use client";

// באנר "השלם את הפרופיל" (סעיף 1.4) — נועד לעודד את המשתמש למלא תחום ואזור
// מגורים, כדי שנוכל לשלוח לו משרות מותאמות למייל. מופיע רק כשחסר פרט פרופיל
// כלשהו (טלפון/עיר/תחום/ניסיון), וניתן לסגירה. אחרי שהפרטים נשמרים (הטופס נמצא
// באותו עמוד) הבאנר נעלם מעצמו כי ה-user מתעדכן ל"פרופיל שלם".
import { useEffect, useState } from "react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { Target, X } from "@/lib/icons";

const DISMISS_KEY = "ds_profile_banner_dismissed";

/** האם חסר פרט פרופיל כלשהו — כלומר יש מה להשלים. */
function isProfileIncomplete(user: AuthUser): boolean {
  return (
    !user.phone ||
    !user.city ||
    !user.preferredFields?.length ||
    user.yearsExperience == null
  );
}

export function ProfileCompletionBanner() {
  const { user } = useAuth();
  // מתחילים סמוי ומחליטים ב-useEffect — נמנע קריאת localStorage ב-SSR (hydration).
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "candidate" || !isProfileIncomplete(user)) {
      setShow(false);
      return;
    }
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    setShow(!dismissed);
  }, [user]);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <div className="relative mb-6 flex items-start gap-3 rounded-2xl border border-olive-200 bg-olive-50 p-4 sm:p-5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-700"
        aria-hidden="true"
      >
        <Target className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 pe-6">
        <p className="font-display text-base font-bold text-ink-900">
          עוד פרט אחד — ונשלח לך משרות שמתאימות לך
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-700">
          מלא תחום ואזור מגורים כדי שנשלח לך משרות מתאימות למייל — בלי הצפות,
          ובלי מיילים בשבת ובחגים. הפרטים ממש כאן למטה.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="סגירת ההודעה"
        className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-olive-100 hover:text-ink-700"
      >
        <X className="h-4 w-4" weight="bold" />
      </button>
    </div>
  );
}
