"use client";

import { useEffect, useState } from "react";
import type { PublicPartner } from "@/types";
import { getPublicPartners } from "@/lib/partners-api";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** משלים פרוטוקול חסר כדי שקישור "www.example.com" יפעל כקישור חיצוני. */
function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * PartnersStrip — סקשן "עם מי אנחנו עובדים": רשת לוגואים של חנויות/מעסיקים
 * שהסכימו להופיע. RTL, גוונים עדינים (grayscale שמתעורר במעבר עכבר).
 * שולף בצד-לקוח (לא חוסם cold-start) ומתדרדר בשקט — אם אין שותפים, לא מרנדר
 * כלום, כך שאפשר לשבץ אותו בעמוד הבית בשורה אחת בלי סקשן ריק.
 *
 * צניעות: לוגו בלבד — ללא תמונות אנשים/פנים (נאכף באישור הצוות בעת ההוספה).
 */
export function PartnersStrip() {
  const [partners, setPartners] = useState<PublicPartner[]>([]);

  useEffect(() => {
    let active = true;
    getPublicPartners().then((list) => {
      if (active) setPartners(list);
    });
    return () => {
      active = false;
    };
  }, []);

  if (partners.length === 0) return null;

  return (
    <section
      dir="rtl"
      className="border-y border-sand-200 bg-white px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="השותפים שלנו"
          title="עם מי אנחנו עובדים"
          subtitle="מעסיקים וחנויות מהציבור שבחרו להשים אצלנו כוח אדם."
        />

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {partners.map((p) => (
            <li key={p.id}>
              <PartnerLogo partner={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: PublicPartner }) {
  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={partner.logoUrl}
      alt={partner.partnerName}
      title={partner.partnerName}
      loading="lazy"
      className="max-h-14 max-w-full object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  );

  const boxClass =
    "group flex h-24 items-center justify-center rounded-xl border border-sand-200 bg-sand-50/40 p-4 transition-colors hover:bg-white";

  if (partner.linkUrl) {
    return (
      <a
        href={normalizeUrl(partner.linkUrl)}
        target="_blank"
        rel="nofollow noopener noreferrer"
        aria-label={partner.partnerName}
        className={boxClass}
      >
        {inner}
      </a>
    );
  }

  return <div className={boxClass}>{inner}</div>;
}
