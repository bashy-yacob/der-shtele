import { cn } from "@/lib/utils";

interface SkylineMotifProps {
  className?: string;
}

/**
 * מוטיב line-art עדין של קו-רקיע עירוני (בתים/מבנים) — ללא אנשים.
 * stroke ב-currentColor כך שהצבע נשלט מבחוץ; מיועד לרקע Hero ובאנרים.
 * aria-hidden — דקורטיבי בלבד.
 */
export function SkylineMotif({ className }: SkylineMotifProps) {
  return (
    <svg
      viewBox="0 0 1200 200"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={cn("text-current", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* קו קרקע */}
        <line x1="0" y1="190" x2="1200" y2="190" />

        {/* מבנה רחב משמאל */}
        <path d="M40 190 V120 H150 V190" />
        <line x1="70" y1="120" x2="70" y2="190" />
        <line x1="120" y1="120" x2="120" y2="190" />
        <path d="M40 120 L95 95 L150 120" />

        {/* מגדל גבוה עם גג מחודד */}
        <path d="M210 190 V70 H270 V190" />
        <path d="M210 70 L240 40 L270 70" />
        <line x1="240" y1="40" x2="240" y2="22" />
        <rect x="228" y="95" width="24" height="30" />

        {/* מבנה אמצעי עם חלונות קשתיים */}
        <path d="M330 190 V110 H470 V190" />
        <path d="M360 150 a14 14 0 0 1 28 0 V190" />
        <path d="M412 150 a14 14 0 0 1 28 0 V190" />
        <path d="M330 110 L400 85 L470 110" />

        {/* כיפה — מוטיב קהילתי/בית כנסת (גאומטרי, ללא אנשים) */}
        <path d="M540 190 V120 H660 V190" />
        <path d="M540 120 Q600 60 660 120" />
        <line x1="600" y1="70" x2="600" y2="48" />
        <line x1="588" y1="56" x2="612" y2="56" />
        <rect x="572" y="140" width="20" height="50" />
        <rect x="608" y="140" width="20" height="50" />

        {/* גורד שחקים דק */}
        <path d="M720 190 V40 H760 V190" />
        <line x1="730" y1="60" x2="730" y2="180" />
        <line x1="750" y1="60" x2="750" y2="180" />
        <line x1="740" y1="40" x2="740" y2="26" />

        {/* שורת בתים נמוכים */}
        <path d="M820 190 V140 H880 V190" />
        <path d="M820 140 L850 120 L880 140" />
        <path d="M880 190 V150 H940 V190" />
        <path d="M880 150 L910 130 L940 150" />

        {/* מבנה ימני אחרון */}
        <path d="M1000 190 V95 H1120 V190" />
        <line x1="1040" y1="95" x2="1040" y2="190" />
        <line x1="1080" y1="95" x2="1080" y2="190" />
        <path d="M1000 95 L1060 70 L1120 95" />
      </g>
    </svg>
  );
}
