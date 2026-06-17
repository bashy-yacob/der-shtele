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
  | "pending" // ממתין לתשלום
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
  createdAt: string; // ISO date string
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
  createdAt: string;
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
  status: JobStatus;
  openedAt: string;
  closedAt: string | null;
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

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
