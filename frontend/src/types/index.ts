// ============================================================
// טיפוסים משותפים - דער שטעלע
// שלב א: אתר ציבורי | שלב ב: CRM | שלב ג: עמלות ותזכורות
// ============================================================

// ----------------------------------------------------------------
// Enums משותפים
// ----------------------------------------------------------------

export type JobField =
  | "logistics"
  | "admin"
  | "sales"
  | "education"
  | "tech"
  | "finance"
  | "healthcare"
  | "other";

// עיר/אזור — טקסט חופשי. ערים חדשות מתווספות אוטומטית בעת יצירת משרה/מועמד.
// רשימת הברירה נגזרת מהנתונים (ראה getRegions / DEFAULT_CITIES).
export type Region = string;

// ----------------------------------------------------------------
// סטטוסים — מוגדרים כאן, מעברים חוקיים ב-lib/statusMachine.ts
// ----------------------------------------------------------------

export type JobStatus =
  | "pending" // ממתינה לאישור הצוות (פורסמה ע"י מעסיק)
  | "active" // פעילה, מוצגת באתר
  | "paused" // מושהית זמנית
  | "closed" // נסגרה ללא גיוס
  | "filled"; // גויסה בהצלחה

export type CandidateStatus =
  | "new" // נכנס — טרם טופל
  | "in_progress" // בטיפול הצוות
  | "presented" // הוצג למעסיק אחד לפחות
  | "hired" // גויס
  | "not_suitable"; // לא מתאים — ארכיב

export type PlacementStatus =
  | "pending" // גיוס הוצע, ממתין לאישור
  | "confirmed" // גיוס אושר — עמלה מגיעה
  | "guarantee" // בתוך תקופת ערבות (3 חודשים)
  | "completed" // תקופת ערבות עברה — סגור
  | "cancelled"; // בוטל (החזר חלקי אם בתוך ערבות)

export type CommissionStatus =
  | "not_due" // טרם לגבייה — בתוך תקופת הערבות
  | "due" // לגבייה — הערבות הסתיימה בהצלחה
  | "invoiced" // חשבונית נשלחה
  | "paid" // שולם
  | "partial_refund"; // החזר חלקי (ערבות)

// ----------------------------------------------------------------
// שלב א — אתר ציבורי
// ----------------------------------------------------------------

/** מה שמועמד רואה באתר — ללא פרטי מעסיק */
export interface PublicJob {
  id: string;
  title: string;
  description: string; // תיאור אנונימי
  field: JobField;
  region: Region;
  scope: string; // 'מלאה' | 'חלקית' | 'גמיש'
  experience?: string | null; // ניסיון נדרש — גלוי לציבור (שכר נשאר פנימי)
  createdAt: string; // ISO date string
  featured?: boolean; // משרה ממומנת — מוצגת בראש הלוח עם תג "מקודם"
}

/** טופס הגשת מועמדות מהאתר */
export interface CandidateFormData {
  fullName: string;
  phone: string;
  email: string;
  field: JobField;
  region: Region;
  jobId?: string; // אם הוגש על משרה ספציפית
  notes?: string;
  cvFile: File;
}

// ----------------------------------------------------------------
// שלב ב — CRM פנימי
// ----------------------------------------------------------------

/** מועמד במערכת הפנימית */
export interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  field: JobField;
  region: Region;
  birthYear: number | null; // שנת לידה — אופציונלי, נמסר בהגשה למשרה ספציפית
  cvUrl: string | null; // Supabase Storage URL
  cvUploadedAt: string | null;
  status: CandidateStatus;
  notes: string | null; // הערות פנימיות לצוות
  createdAt: string;
  updatedAt: string;
}

/** רשומת שיחה עם מועמד */
export interface CallLog {
  id: string;
  candidateId: string;
  staffName: string; // מי מהצוות התקשר
  calledAt: string; // ISO date string
  summary: string;
  followUpAt: string | null; // תזכורת לשיחה חוזרת
}

/** סטטוס אישור מעסיק — תומך בהרשמה עצמית כ"בקשת גישה" (סעיף 6) */
export type EmployerStatus = "pending" | "approved" | "rejected";

/** מעסיק — נשמר פנימי, לא חשוף לציבור */
export interface Employer {
  id: string;
  companyName: string;
  businessNumber: string | null; // ח.פ
  address: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string | null; // אמינות, העדפות, הערות
  status: EmployerStatus; // pending=נרשם עצמאית וממתין; approved=מאושר; rejected=נדחה
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  _count?: { jobs: number }; // מספר המשרות של המעסיק — מאוכלס ברשימת המעסיקים
}

/** משרה — גרסה פנימית מלאה */
export interface InternalJob {
  id: string;
  employerId: string;
  employer?: Employer; // populated join
  title: string;
  descriptionPublic: string; // מה שעולה לאתר
  descriptionInternal: string; // דרישות מלאות, פנימי
  field: JobField;
  region: Region;
  scope: string;
  experience?: string | null; // ניסיון נדרש — גלוי לציבור
  salary?: string | null; // שכר מוצע — פנימי בלבד
  status: JobStatus;
  openedAt: string;
  closedAt: string | null;
  // קידום בתשלום (Featured) — נשלט מהדשבורד; prepaid
  featuredUntil?: string | null;
  featuredPaymentStatus?: AdPaymentStatus;
  featuredPaidAt?: string | null;
  featuredPrice?: number | null;
}

/** הצגת מועמד למשרה */
export interface JobPresentation {
  id: string;
  jobId: string;
  candidateId: string;
  candidate?: Pick<Candidate, "id" | "fullName" | "phone">;
  presentedAt: string;
  status: CandidateStatus; // סטטוס המועמד ביחס למשרה הספציפית
  notes: string | null;
}

// ----------------------------------------------------------------
// שלב ג — עמלות ותזכורות
// ----------------------------------------------------------------

/** סוג פעולה בלוג הגיוס — מקביל ל-PlacementEventType ב-Prisma */
export type PlacementEventType =
  | "created" // הגיוס נוצר
  | "confirmed" // הגיוס אושר
  | "guarantee" // נכנס לתקופת ערבות
  | "completed" // הגיוס הושלם
  | "cancelled" // הגיוס בוטל
  | "commission_due" // העמלה נכנסה לגבייה (תום ערבות)
  | "commission_invoiced" // נשלחה חשבונית
  | "commission_paid" // העמלה שולמה
  | "commission_refunded" // החזר חלקי
  | "amount_updated"; // סכום העמלה עודכן

/** רשומת לוג — פעולה אחת בהיסטוריית הגיוס */
export interface PlacementEvent {
  id: string;
  placementId: string;
  type: PlacementEventType;
  note: string | null;
  createdBy: string | null; // שם הנציג שביצע
  createdAt: string; // ISO date string
}

/** גיוס מוצלח */
export interface Placement {
  id: string;
  jobId: string;
  candidateId: string;
  employerId: string;
  job?: Pick<InternalJob, "id" | "title">;
  candidate?: Pick<Candidate, "id" | "fullName">;
  employer?: Pick<Employer, "id" | "companyName">;
  placedAt: string;
  guaranteeEndsAt: string; // placedAt + 3 חודשים
  status: PlacementStatus;
  commissionAmount: number | null; // בשקלים
  commissionStatus: CommissionStatus;
  notes: string | null;
  events?: PlacementEvent[]; // לוג פעולות (היסטוריה מלאה)
}

/** תזכורת לצוות */
export interface Reminder {
  id: string;
  candidateId: string | null;
  jobId: string | null;
  message: string;
  remindAt: string; // ISO date string
  done: boolean;
  createdBy: string; // שם נציג
}

/** סטטיסטיקות ללוח בקרה */
export interface DashboardStats {
  newCandidatesThisWeek: number;
  activeCandidates: number;
  activeJobs: number;
  placementsThisMonth: number;
  pendingCommissions: number; // בשקלים
  overdueReminders: number;
  activeSubscribers: number;
  queueCount: number;
  commissionsDueCount: number; // עמלות בשלות לחיוב (סטטוס אפקטיבי 'due')
  newContactsCount: number; // פניות שטרם טופלו
}

/** קישור מינימלי למשרה (לתצוגת שיוך) */
export interface JobRef {
  id: string;
  title: string;
}

/** מועמד בתור הטיפול (ווידג'ט) */
export interface QueueItem {
  id: string;
  fullName: string;
  field: JobField;
  region: Region;
  createdAt: string;
  job: JobRef | null; // המשרה שאליה הוגש (אם הוגש דרך משרה)
}

/** משרה פעילה + מספר מועמדים שהוצגו (ווידג'ט) */
export interface ActiveJobWidget {
  id: string;
  title: string;
  field: JobField;
  region: Region;
  presentedCount: number;
}

/** תמונת מצב מלאה של לוח הבקרה */
export interface DashboardSummary {
  stats: DashboardStats;
  queue: QueueItem[];
  activeJobs: ActiveJobWidget[];
  openReminders: Reminder[];
}

/** הצגת מועמד למשרה — עם פרטי המשרה (לכרטיס המועמד) */
export interface PresentationWithJob extends JobPresentation {
  job?: Pick<InternalJob, "id" | "title">;
}

/** מועמד מלא לכרטיס ה-CRM — כולל שיחות, הצגות וגיוסים */
export interface CandidateDetail extends Candidate {
  callLogs: CallLog[];
  presentations: PresentationWithJob[];
  placements: Placement[];
  // הסכמת מייל לצרכי ציות (סעיף 7.2) — מהמשתמש המקושר, null אם אין משתמש.
  user?: {
    optInMarketing: boolean;
    optInAt: string | null;
    emailVerified: boolean;
  } | null;
}

/** הצגת מועמד למשרה — עם פרטי המועמד (לעמוד המשרה) */
export interface PresentationWithCandidate extends JobPresentation {
  candidate?: Pick<Candidate, "id" | "fullName" | "phone"> & {
    status: CandidateStatus;
  };
}

/** משרה מלאה לעמוד ה-CRM — כולל מעסיק והצגות מועמדים */
export interface JobDetail extends InternalJob {
  employer?: Employer;
  presentations: PresentationWithCandidate[];
}

/** מועמד ברשימת ה-CRM — כולל המשרות שהוגש אליהן (לתצוגת שיוך) */
export interface CandidateListItem extends Candidate {
  presentations: { jobId: string; job: JobRef | null }[];
}

/** מנוי ברשימת התפוצה */
export interface Subscriber {
  userId: string;
  email: string;
  fullName: string;
  optInAt: string | null;
  field: JobField | null;
  region: Region | null;
  status: CandidateStatus | null;
}

// ----------------------------------------------------------------
// כללי
// ----------------------------------------------------------------

export interface ContactInfo {
  phone: string;
  email: string;
  hours: string;
}

/** סוג פנייה מטופס "צור קשר" — מקביל ל-InquiryType ב-backend */
export type InquiryType = "candidate" | "employer" | "general";

/** פנייה נכנסת מטופס "צור קשר" / פניית מעסיק (טבלת contacts) */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  inquiry_type: InquiryType;
  message: string;
  resumePath: string | null;
  // פרטים מובְנים מפניית מעסיק — null/undefined לפניות מועמד/כללי
  email?: string | null;
  companyName?: string | null;
  businessNumber?: string | null;
  companyLocation?: string | null;
  jobTitle?: string | null;
  field?: JobField | null;
  region?: Region | null;
  scope?: string | null;
  experience?: string | null;
  salary?: string | null;
  // טיפול הצוות — null = טרם טופל; חותמת זמן = טופל
  handledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------
// המלצות לקוחות — מוצגות בדף הבית (קרוסלה), מנוהלות מהדשבורד
// ----------------------------------------------------------------

/** המלצת לקוח מלאה — כפי שהצוות רואה ומנהל בדשבורד */
export interface Testimonial {
  id: string;
  authorName: string; // שם פרטי / ראשי תיבות
  authorRole?: string | null; // תיאור / הקשר
  quote: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** המלצה ציבורית — תת-הקבוצה המוצגת באתר (ללא שדות ניהול) */
export type PublicTestimonial = Pick<
  Testimonial,
  "id" | "authorName" | "authorRole" | "quote"
>;

// ----------------------------------------------------------------
// שלב ד — פרסומות (מודעות חסות + משרות ממומנות)
// ----------------------------------------------------------------

/** מיקום הצגת מודעה — מקביל ל-AdPlacement ב-backend */
export type AdPlacement = "homepage" | "jobs_list" | "footer";

/** מחזור חיים של מודעה — מקביל ל-AdStatus ב-backend */
export type AdStatus =
  "draft" | "pending_payment" | "active" | "paused" | "expired";

/** סטטוס תשלום — משותף למודעות ולמשרות ממומנות */
export type AdPaymentStatus = "unpaid" | "paid";

/** מודעה ציבורית — מה שמוצג באתר (ללא פרטי מפרסם/תשלום) */
export interface PublicAd {
  id: string;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  placement: AdPlacement;
  order: number;
}

/** מודעה מלאה — כפי שהצוות רואה ומנהל בדשבורד */
export interface Advertisement {
  id: string;
  advertiserName: string; // פנימי
  contactPhone: string; // פנימי
  contactEmail?: string | null; // פנימי
  title: string;
  body?: string | null;
  imagePath?: string | null;
  linkUrl?: string | null;
  placement: AdPlacement;
  order: number;
  status: AdStatus;
  paymentStatus: AdPaymentStatus;
  paidAt?: string | null;
  agreedPrice?: number | null; // ש"ח — פנימי
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
