import { getPublicAds } from "@/lib/api";
import type { AdPlacement } from "@/types";
import { AdBanner } from "./AdBanner";

interface AdZoneProps {
  placement: AdPlacement;
  title?: string; // כותרת קטנה מעל המודעות (אופציונלי)
  className?: string;
}

/**
 * אזור תצוגת מודעות חסות למיקום נתון. מציג ריק (null) אם אין מודעות חיות —
 * כך שאין "חור" בעיצוב. server component (שולף מהבק עם revalidate).
 */
export async function AdZone({ placement, title, className = "" }: AdZoneProps) {
  const ads = await getPublicAds(placement);
  if (ads.length === 0) return null;

  return (
    <div className={className}>
      {title && (
        <p className="mb-3 text-center text-sm font-semibold text-ink-400">
          {title}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {ads.map((ad) => (
          <AdBanner key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  );
}
