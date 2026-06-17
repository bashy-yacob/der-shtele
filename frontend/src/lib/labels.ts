// labels — מיפוי ערכי enum לתוויות עברית. מקור אמת אחד לכל הדשבורד.
import type {
  JobField,
  JobStatus,
  CandidateStatus,
  PlacementStatus,
  CommissionStatus,
  PlacementEventType,
  InquiryType,
} from "@/types";

// עיר/אזור — טקסט חופשי. הכלים נמצאים ב-constants ומיוצאים מחדש כאן לנוחות.
export { DEFAULT_CITIES, regionLabel, buildCityOptions } from "./constants";

export const FIELD_LABELS: Record<JobField, string> = {
  logistics: "לוגיסטיקה",
  admin: "אדמיניסטרציה",
  sales: "מכירות",
  education: "חינוך",
  tech: "מחשבים",
  finance: "כספים",
  healthcare: "בריאות",
  other: "אחר",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
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
  pending: "ממתין לתשלום",
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
  commission_invoiced: "נשלחה חשבונית",
  commission_paid: "העמלה שולמה",
  commission_refunded: "החזר חלקי למעסיק",
  amount_updated: "סכום העמלה עודכן",
};

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  candidate: "מועמד/ת",
  employer: "מעסיק",
  general: "כללי",
};

export const SCOPE_OPTIONS = ["מלאה", "חלקית", "גמיש"] as const;

/** צבע badge לפי סטטוס — גוונים שמרניים מתוך מערכת העיצוב. */
export const STATUS_TONE: Record<string, string> = {
  // candidate
  new: "bg-navy-50 text-navy-700",
  in_progress: "bg-sand-200 text-ink-700",
  presented: "bg-olive-100 text-olive-700",
  hired: "bg-olive-500 text-white",
  not_suitable: "bg-sand-100 text-ink-500",
  // job
  active: "bg-olive-100 text-olive-700",
  paused: "bg-sand-200 text-ink-700",
  closed: "bg-sand-100 text-ink-500",
  filled: "bg-navy-600 text-white",
  // placement / commission
  confirmed: "bg-navy-50 text-navy-700",
  guarantee: "bg-sand-200 text-ink-700",
  completed: "bg-olive-500 text-white",
  cancelled: "bg-red-100 text-red-700",
  invoiced: "bg-navy-50 text-navy-700",
  paid: "bg-olive-500 text-white",
  partial_refund: "bg-red-100 text-red-700",
  // inquiry_type (פניות)
  employer: "bg-navy-50 text-navy-700",
  candidate: "bg-olive-100 text-olive-700",
  general: "bg-sand-200 text-ink-700",
};
