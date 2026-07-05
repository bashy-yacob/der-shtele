// admin-api — קריאות ה-CRM/דשבורד מהדפדפן, דרך הפרוקסי same-origin (/api/admin/*).
// כל קריאה נושאת את ה-Bearer token מ-localStorage. ה-backend אוכף role=staff/admin.
"use client";

import type {
  Advertisement,
  AdPlacement,
  AdPaymentStatus,
  Candidate,
  CandidateDetail,
  CandidateListItem,
  CandidateStatus,
  CallLog,
  Contact,
  DashboardSummary,
  Employer,
  InquiryType,
  InternalJob,
  JobDetail,
  JobField,
  JobStatus,
  JobPresentation,
  Placement,
  PlacementStatus,
  CommissionStatus,
  Region,
  Reminder,
  Subscriber,
  Testimonial,
} from "@/types";

const TOKEN_KEY = "ds_token";

/** מעטפת עימוד אחידה מהשרת — items של העמוד + total כולל לחישוב מספר העמודים. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** בונה query string — מדלג על ערכים ריקים/undefined (ה-backend דוחה פרמטרים לא-מוכרים). */
function qs(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function token(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

/** עוטף קריאה לפרוקסי ומחזיר את ה-data; זורק Error בעברית בכשל. */
async function adminFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const t = token();
  const headers: Record<string, string> = {};
  if (t) headers.Authorization = `Bearer ${t}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`/api/admin/${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    data?: T;
    error?: string;
  } | null;

  if (res.status === 401) throw new Error("נדרשת התחברות מחדש");
  if (res.status === 403) throw new Error("אין לך הרשאה לפעולה זו");
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "שגיאה בתקשורת עם השרת");
  }
  return json.data as T;
}

// ---- לוח בקרה ----
export const getDashboard = () =>
  adminFetch<DashboardSummary>("dashboard/summary");

// ---- פניות (טופס "צור קשר" + פניות מעסיקים) ----
// GET /api/contact — staff/admin בלבד. הפניות נשמרות בטבלת contacts ומיון יורד לפי תאריך.
export const listContacts = () => adminFetch<Contact[]>("contact");
/** רשימת הפניות עם עימוד/סינון בצד שרת; openCount = פניות שטרם טופלו (בכל המערכת). */
export const listContactsPaged = (params: {
  page: number;
  pageSize: number;
  search?: string;
  type?: InquiryType;
  handled?: "open" | "handled";
}) =>
  adminFetch<Paginated<Contact> & { openCount: number }>(
    `contact/paged${qs(params)}`,
  );
/** סימון פנייה כטופלה / ביטול — מחזיר את הפנייה המעודכנת. */
export const setContactHandled = (id: string, handled: boolean) =>
  adminFetch<Contact>(`contact/${id}/handled`, {
    method: "PATCH",
    body: { handled },
  });
/** signed URL זמני לקו"ח שצורף לפנייה (צוות בלבד). */
export const getContactResume = (id: string) =>
  adminFetch<{ url: string }>(`contact/${id}/resume`);

// ---- מועמדים ----
/** רשימה מלאה — לבוררי-בחירה (בחירת מועמד למשרה). לרשימת הניהול השתמש ב-listCandidatesPaged. */
export const listCandidates = () =>
  adminFetch<CandidateListItem[]>("candidates");
/** רשימת הניהול עם עימוד/סינון בצד שרת. */
export const listCandidatesPaged = (params: {
  page: number;
  pageSize: number;
  search?: string;
  field?: JobField;
  region?: string;
  status?: CandidateStatus;
}) =>
  adminFetch<Paginated<CandidateListItem>>(`candidates/paged${qs(params)}`);
export const getCandidate = (id: string) =>
  adminFetch<CandidateDetail>(`candidates/${id}`);
export const updateCandidate = (
  id: string,
  body: { status?: CandidateStatus; notes?: string; city?: string },
) => adminFetch<Candidate>(`candidates/${id}`, { method: "PATCH", body });
export const getCandidateResume = (id: string) =>
  adminFetch<{ url: string }>(`candidates/${id}/resume`);
/** סימון מועמד כגויס — יוצר גיוס + עמלה ומחזיר את המועמד המעודכן. */
export const hireCandidate = (
  id: string,
  body: { jobId: string; commissionAmount: number },
) =>
  adminFetch<CandidateDetail>(`candidates/${id}/hire`, {
    method: "POST",
    body,
  });
export const addCallLog = (
  id: string,
  body: { staffName: string; summary: string; followUpAt?: string },
) => adminFetch<CallLog>(`candidates/${id}/calls`, { method: "POST", body });

// ---- מעסיקים ----
/** רשימה מלאה — לבוררי-בחירה (בחירת מעסיק במשרה חדשה). לניהול השתמש ב-listEmployersPaged. */
export const listEmployers = () => adminFetch<Employer[]>("employers");
/** רשימת הניהול עם עימוד/סינון בצד שרת; pending = כל הבקשות הממתינות (כרטיסים נפרדים). */
export const listEmployersPaged = (params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "approved" | "rejected";
}) =>
  adminFetch<Paginated<Employer> & { pending: Employer[] }>(
    `employers/paged${qs(params)}`,
  );
export const createEmployer = (body: {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessNumber?: string;
  address?: string;
  notes?: string;
}) => adminFetch<Employer>("employers", { method: "POST", body });

/** הפקת פרטי כניסה לפורטל המעסיק (סעיף 6). */
export const createPortalUser = (
  employerId: string,
  body: { email: string; password: string; fullName?: string },
) =>
  adminFetch<{ id: string; email: string; fullName: string }>(
    `employers/${employerId}/portal-user`,
    { method: "POST", body },
  );

/** אישור בקשת גישה של מעסיק (הרשמה עצמית) — pending → approved. */
export const approveEmployer = (id: string) =>
  adminFetch<Employer>(`employers/${id}/approve`, { method: "PATCH" });

/** דחיית בקשת גישה — pending → rejected, עם סיבה אופציונלית. */
export const rejectEmployer = (id: string, reason?: string) =>
  adminFetch<Employer>(`employers/${id}/reject`, {
    method: "PATCH",
    body: { reason },
  });

// ---- ערים/אזורים ----
// רשימת הערים הקיימות (משרות+מועמדים) — להזנת רשימות הבחירה בטפסים.
export const listRegions = () => adminFetch<string[]>("jobs/regions");

// ---- משרות ----
export const listJobs = () => adminFetch<InternalJob[]>("jobs/admin/all");
export const getJob = (id: string) => adminFetch<JobDetail>(`jobs/admin/${id}`);
export const createJob = (body: {
  employerId: string;
  title: string;
  descriptionPublic: string;
  descriptionInternal: string;
  field: JobField;
  region: Region;
  scope: string;
  experience?: string;
  salary?: string;
}) => adminFetch<InternalJob>("jobs", { method: "POST", body });
export const updateJob = (
  id: string,
  body: Partial<{
    title: string;
    descriptionPublic: string;
    descriptionInternal: string;
    field: JobField;
    region: Region;
    scope: string;
    experience: string;
    salary: string;
    status: JobStatus;
    // קידום בתשלום (Featured) — prepaid נאכף בבק
    featuredUntil: string | null;
    featuredPaymentStatus: AdPaymentStatus;
    featuredPrice: number;
  }>,
) => adminFetch<InternalJob>(`jobs/${id}`, { method: "PATCH", body });

// ---- הצגות מועמדים ----
export const createPresentation = (body: {
  jobId: string;
  candidateId: string;
  notes?: string;
}) => adminFetch<JobPresentation>("applications", { method: "POST", body });
export const updatePresentation = (
  id: string,
  body: { status?: CandidateStatus; notes?: string },
) =>
  adminFetch<JobPresentation>(`applications/${id}`, { method: "PATCH", body });

// ---- עמלות / גיוסים ----
export const listCommissions = () => adminFetch<Placement[]>("commissions");
export const getCommissionsSummary = () =>
  adminFetch<{ count: number; pendingTotal: number }>("commissions/summary");
export const updateCommissionStatus = (
  placementId: string,
  status: CommissionStatus,
) =>
  adminFetch<Placement>(`commissions/${placementId}`, {
    method: "PATCH",
    body: { status },
  });

export const listPlacements = () => adminFetch<Placement[]>("placements");
export const getPlacement = (id: string) =>
  adminFetch<Placement>(`placements/${id}`);
export const createPlacement = (body: {
  jobId: string;
  candidateId: string;
  employerId: string;
  commissionAmount?: number;
  notes?: string;
}) => adminFetch<Placement>("placements", { method: "POST", body });
export const updatePlacement = (
  id: string,
  body: Partial<{
    status: PlacementStatus;
    commissionAmount: number;
    notes: string;
  }>,
) => adminFetch<Placement>(`placements/${id}`, { method: "PATCH", body });

// ---- תזכורות ----
export const listReminders = (includeDone = false) =>
  adminFetch<Reminder[]>(`reminders?includeDone=${includeDone}`);
export const createReminder = (body: {
  message: string;
  remindAt: string;
  createdBy: string;
  candidateId?: string;
  jobId?: string;
}) => adminFetch<Reminder>("reminders", { method: "POST", body });
export const updateReminder = (
  id: string,
  body: Partial<{ message: string; remindAt: string; done: boolean }>,
) => adminFetch<Reminder>(`reminders/${id}`, { method: "PATCH", body });
export const deleteReminder = (id: string) =>
  adminFetch<{ id: string }>(`reminders/${id}`, { method: "DELETE" });

// ---- רשימת תפוצה ----
export const listSubscribers = (
  filter: {
    field?: JobField;
    region?: Region;
    status?: CandidateStatus;
  } = {},
) => {
  const params = new URLSearchParams();
  if (filter.field) params.set("field", filter.field);
  if (filter.region) params.set("region", filter.region);
  if (filter.status) params.set("status", filter.status);
  const q = params.toString();
  return adminFetch<Subscriber[]>(`mailing/subscribers${q ? `?${q}` : ""}`);
};
export const sendMailing = (body: {
  subject: string;
  body: string;
  filter?: { field?: JobField; region?: Region; status?: CandidateStatus };
}) =>
  adminFetch<{ total: number; sent: number }>("mailing/send", {
    method: "POST",
    body,
  });
/** מצב שבת/חג נוכחי — לחסימת שליחה בצד-לקוח. */
export const getShabbatStatus = () =>
  adminFetch<{ forbidden: boolean; until: string | null }>(
    "mailing/shabbat-status",
  );

// ---- המלצות לקוחות ----
// כל ההמלצות (כולל לא-מפורסמות) — לניהול הצוות.
export const listTestimonials = () =>
  adminFetch<Testimonial[]>("testimonials/admin/all");
export const createTestimonial = (body: {
  authorName: string;
  quote: string;
  authorRole?: string;
  published?: boolean;
  order?: number;
}) => adminFetch<Testimonial>("testimonials", { method: "POST", body });
export const updateTestimonial = (
  id: string,
  body: Partial<{
    authorName: string;
    authorRole: string;
    quote: string;
    published: boolean;
    order: number;
  }>,
) => adminFetch<Testimonial>(`testimonials/${id}`, { method: "PATCH", body });
export const deleteTestimonial = (id: string) =>
  adminFetch<{ ok: true }>(`testimonials/${id}`, { method: "DELETE" });

// ---- פרסומות (מודעות חסות) ----
// כל השדות הכספיים/פנימיים נשלחים רק לצוות. שער prepaid נאכף בבק.
export interface AdInput {
  advertiserName: string;
  contactPhone: string;
  contactEmail?: string;
  title: string;
  body?: string;
  imagePath?: string;
  linkUrl?: string;
  placement: AdPlacement;
  order?: number;
  status?: Advertisement["status"];
  paymentStatus?: AdPaymentStatus;
  agreedPrice?: number;
  startDate?: string;
  endDate?: string;
}

export const listAds = () =>
  adminFetch<Advertisement[]>("advertisements/admin/all");
export const createAd = (body: AdInput) =>
  adminFetch<Advertisement>("advertisements", { method: "POST", body });
export const updateAd = (id: string, body: Partial<AdInput>) =>
  adminFetch<Advertisement>(`advertisements/${id}`, { method: "PATCH", body });
export const deleteAd = (id: string) =>
  adminFetch<{ ok: true }>(`advertisements/${id}`, { method: "DELETE" });

/** העלאת תמונת באנר (multipart) — דרך route ייעודי כי הפרוקסי הגנרי מעביר JSON בלבד. */
export async function uploadAdImage(file: File): Promise<{ path: string }> {
  const t = token();
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/admin/ads-image", {
    method: "POST",
    headers: t ? { Authorization: `Bearer ${t}` } : {},
    body: form,
  });
  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    data?: { path: string };
    error?: string;
  } | null;
  if (res.status === 401) throw new Error("נדרשת התחברות מחדש");
  if (res.status === 403) throw new Error("אין לך הרשאה לפעולה זו");
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "שגיאה בהעלאת התמונה");
  }
  return json.data as { path: string };
}
