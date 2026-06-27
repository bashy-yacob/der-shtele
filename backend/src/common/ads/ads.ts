// ads — לוגיקת שער תשלום-מראש (prepaid) לפרסומות ולמשרות ממומנות (שלב ד).
//
// כלל ברזל עסקי: מודעה/משרה מקודמת עולה לאוויר **רק** אחרי שהתשלום נגבה
// (paymentStatus=paid), היא active, ובתוך חלון התאריכים. ה-DB הוא מקור האמת —
// הפונקציות כאן טהורות (ללא תלות ב-Nest/Prisma client) וניתנות לבדיקה.

import { AdStatus, AdPaymentStatus } from "@prisma/client";

/** מינימום השדות הדרושים כדי להכריע אם מודעה מוצגת כרגע. */
export interface AdLive {
  status: AdStatus;
  paymentStatus: AdPaymentStatus;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * האם המודעה מוצגת כעת לציבור? — שולמה, פעילה, ובתוך חלון התאריכים.
 * זה השער הקשיח; שאילתת ה-DB יכולה לסנן status/paymentStatus, אך חלון
 * התאריכים נאכף כאן (כמו isCommissionDue בעמלות).
 */
export function isAdLive(ad: AdLive, now: Date = new Date()): boolean {
  return (
    ad.paymentStatus === "paid" &&
    ad.status === "active" &&
    (ad.startDate == null || now >= ad.startDate) &&
    (ad.endDate == null || now <= ad.endDate)
  );
}

/**
 * האם מותר להעביר מודעה ל-status=active לפי מצב התשלום הצפוי?
 * (משמש את הגארד בשירות — assertCanActivate.)
 */
export function canActivateAd(paymentStatus: AdPaymentStatus): boolean {
  return paymentStatus === "paid";
}

/** מינימום השדות הדרושים כדי להכריע אם משרה מקודמת פעילה. */
export interface JobFeaturedLike {
  featuredPaymentStatus: AdPaymentStatus;
  featuredUntil: Date | null;
}

/**
 * האם המשרה מקודמת כעת? — שולם הקידום ועדיין בתוך חלון הקידום.
 * זה השער היחיד שאוכף את ה-prepaid למשרות ממומנות (מיון/תג נגזרים ממנו).
 */
export function isJobFeaturedActive(
  job: JobFeaturedLike,
  now: Date = new Date(),
): boolean {
  return (
    job.featuredPaymentStatus === "paid" &&
    job.featuredUntil != null &&
    now <= job.featuredUntil
  );
}
