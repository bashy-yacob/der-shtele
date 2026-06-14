// ============================================================
// טיפוסים משותפים - דער שטעלע
// שלב א: אתר ציבורי | שלב ב: CRM | שלב ג: עמלות ותזכורות
// ============================================================

// ----------------------------------------------------------------
// Enums משותפים
// ----------------------------------------------------------------

export type Gender = 'men' | 'women' | 'mixed';

export type JobField =
  | 'logistics'
  | 'admin'
  | 'sales'
  | 'education'
  | 'tech'
  | 'finance'
  | 'healthcare'
  | 'other';

export type Region =
  | 'bnei_brak'
  | 'jerusalem'
  | 'elad'
  | 'modiin_ilit'
  | 'beitar_ilit'
  | 'other';

// ----------------------------------------------------------------
// סטטוסים — מוגדרים כאן, מעברים חוקיים ב-lib/statusMachine.ts
// ----------------------------------------------------------------

export type JobStatus =
  | 'active'       // פעילה, מוצגת באתר
  | 'paused'       // מושהית זמנית
  | 'closed'       // נסגרה ללא גיוס
  | 'filled';      // גויסה בהצלחה

export type CandidateStatus =
  | 'new'          // נכנס — טרם טופל
  | 'in_progress'  // בטיפול הצוות
  | 'presented'    // הוצג למעסיק אחד לפחות
  | 'hired'        // גויס
  | 'not_suitable';// לא מתאים — ארכיב

export type PlacementStatus =
  | 'pending'      // גיוס הוצע, ממתין לאישור
  | 'confirmed'    // גיוס אושר — עמלה מגיעה
  | 'guarantee'    // בתוך תקופת ערבות (3 חודשים)
  | 'completed'    // תקופת ערבות עברה — סגור
  | 'cancelled';   // בוטל (החזר חלקי אם בתוך ערבות)

export type CommissionStatus =
  | 'pending'      // ממתין לתשלום
  | 'invoiced'     // חשבונית נשלחה
  | 'paid'         // שולם
  | 'partial_refund'; // החזר חלקי (ערבות)

// ----------------------------------------------------------------
// שלב א — אתר ציבורי
// ----------------------------------------------------------------

/** מה שמועמד רואה באתר — ללא פרטי מעסיק */
export interface PublicJob {
  id: string;
  title: string;
  description: string;         // תיאור אנונימי
  field: JobField;
  region: Region;
  gender: Gender;
  scope: string;               // 'מלאה' | 'חלקית' | 'גמיש'
  rabbinicalApproval: boolean;
  createdAt: string;           // ISO date string
}

/** טופס הגשת מועמדות מהאתר */
export interface CandidateFormData {
  fullName: string;
  phone: string;
  email: string;
  field: JobField;
  region: Region;
  jobId?: string;              // אם הוגש על משרה ספציפית
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
  gender: Gender;
  field: JobField;
  region: Region;
  cvUrl: string | null;        // Supabase Storage URL
  cvUploadedAt: string | null;
  status: CandidateStatus;
  notes: string | null;        // הערות פנימיות לצוות
  createdAt: string;
  updatedAt: string;
}

/** רשומת שיחה עם מועמד */
export interface CallLog {
  id: string;
  candidateId: string;
  staffName: string;           // מי מהצוות התקשר
  calledAt: string;            // ISO date string
  summary: string;
  followUpAt: string | null;   // תזכורת לשיחה חוזרת
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
  notes: string | null;          // אמינות, העדפות, הערות
  createdAt: string;
}

/** משרה — גרסה פנימית מלאה */
export interface InternalJob {
  id: string;
  employerId: string;
  employer?: Employer;           // populated join
  title: string;
  descriptionPublic: string;     // מה שעולה לאתר
  descriptionInternal: string;   // דרישות מלאות, פנימי
  field: JobField;
  region: Region;
  gender: Gender;
  scope: string;
  rabbinicalApproval: boolean;
  rabbinicalApprovalBy: string | null;
  status: JobStatus;
  openedAt: string;
  closedAt: string | null;
}

/** הצגת מועמד למשרה */
export interface JobPresentation {
  id: string;
  jobId: string;
  candidateId: string;
  candidate?: Pick<Candidate, 'id' | 'fullName' | 'phone'>;
  presentedAt: string;
  status: CandidateStatus;       // סטטוס המועמד ביחס למשרה הספציפית
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
  job?: Pick<InternalJob, 'id' | 'title'>;
  candidate?: Pick<Candidate, 'id' | 'fullName'>;
  employer?: Pick<Employer, 'id' | 'companyName'>;
  placedAt: string;
  guaranteeEndsAt: string;       // placedAt + 3 חודשים
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
  remindAt: string;              // ISO date string
  done: boolean;
  createdBy: string;             // שם נציג
}

/** סטטיסטיקות ללוח בקרה */
export interface DashboardStats {
  newCandidatesThisWeek: number;
  activeCandidates: number;
  activeJobs: number;
  placementsThisMonth: number;
  pendingCommissions: number;    // בשקלים
  overdueReminders: number;
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
