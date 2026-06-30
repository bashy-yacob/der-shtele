// labels — מיפוי ערכי enum לתוויות עברית. מקור אמת אחד לכל הדשבורד.
import type {
  JobStatus,
  CandidateStatus,
  PlacementStatus,
  CommissionStatus,
  PlacementEventType,
  InquiryType,
} from "@/types";

// עיר/אזור + תחומים — מקור אמת אחד ב-constants, מיוצא מחדש כאן לנוחות.
// FIELD_LABELS משותף לאתר הציבורי ולדשבורד כדי שתחום יוצג זהה בשני המקומות.
export {
  DEFAULT_CITIES,
  regionLabel,
  buildCityOptions,
  FIELD_LABELS,
} from "./constants";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "ממתינה לאישור",
  active: "פעילה",
  paused: "מושהית",
  closed: "סגורה",
  filled: "גויסה",
};

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: "חדש",
  in_progress: "בטיפול",
  presented: "הוצג למעסיק",
  hired: "גויס",
  not_suitable: "לא מתאים",
};

export const PLACEMENT_STATUS_LABELS: Record<PlacementStatus, string> = {
  pending: "ממתין לאישור",
  confirmed: "אושר",
  guarantee: "בתקופת ערבות",
  completed: "הושלם",
  cancelled: "בוטל",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  not_due: "טרם לגבייה",
  due: "לגבייה",
  invoiced: "חשבונית נשלחה",
  paid: "שולם",
  partial_refund: "החזר חלקי",
};

/** תוויות פעולות בלוג הגיוס — שורה אחת לכל אירוע בהיסטוריה. */
export const PLACEMENT_EVENT_LABELS: Record<PlacementEventType, string> = {
  created: "גויס ואושר",
  confirmed: "הגיוס אושר",
  guarantee: "נכנס לתקופת ערבות",
  completed: "הגיוס הושלם",
  cancelled: "הגיוס בוטל",
  commission_due: "העמלה נכנסה לגבייה",
  commission_invoiced: "נשלחה חשבונית",
  commission_paid: "העמלה שולמה",
  commission_refunded: "החזר חלקי למעסיק",
  amount_updated: "סכום העמלה עודכן",
};

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  candidate: "מועמד",
  employer: "מעסיק",
  general: "כללי",
};

/** סטטוס מעסיק (בקשת גישה) — תוויות עבריות לכרטיסי הדשבורד. */
export const EMPLOYER_STATUS_LABELS: Record<
  "pending" | "approved" | "rejected",
  string
> = {
  pending: "ממתין לאישור",
  approved: "מאושר",
  rejected: "נדחה",
};

export const SCOPE_OPTIONS = ["מלאה", "חלקית", "גמיש"] as const;

/** ניסיון נדרש — תואם את פילטר הסינון בלוח המשרות (איפיון 4.3). מקור אמת אחד. */
export const EXPERIENCE_OPTIONS = [
  "ללא ניסיון",
  "שנה ומעלה",
  "3 שנים ומעלה",
  "5 שנים ומעלה",
] as const;

/** צבע badge לפי סטטוס — גוונים שמרניים מתוך מערכת העיצוב. */
export const STATUS_TONE: Record<string, string> = {
  // candidate
  new: "bg-navy-50 text-navy-700",
  in_progress: "bg-sand-200 text-ink-700",
  presented: "bg-olive-100 text-olive-700",
  hired: "bg-olive-500 text-white",
  not_suitable: "bg-sand-100 text-ink-500",
  // job
  pending: "bg-amber-100 text-amber-800",
  active: "bg-olive-100 text-olive-700",
  paused: "bg-sand-200 text-ink-700",
  closed: "bg-sand-100 text-ink-500",
  filled: "bg-navy-600 text-white",
  // placement / commission
  confirmed: "bg-navy-50 text-navy-700",
  guarantee: "bg-sand-200 text-ink-700",
  completed: "bg-olive-500 text-white",
  cancelled: "bg-red-100 text-red-700",
  not_due: "bg-sand-200 text-ink-700",
  due: "bg-amber-100 text-amber-800",
  invoiced: "bg-navy-50 text-navy-700",
  paid: "bg-olive-500 text-white",
  partial_refund: "bg-red-100 text-red-700",
  // inquiry_type (פניות)
  employer: "bg-navy-50 text-navy-700",
  candidate: "bg-olive-100 text-olive-700",
  general: "bg-sand-200 text-ink-700",
  // employer access-request status (pending משותף עם משרה לעיל)
  approved: "bg-olive-100 text-olive-700",
  rejected: "bg-red-100 text-red-700",
};
