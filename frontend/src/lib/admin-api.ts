// admin-api — קריאות ה-CRM/דשבורד מהדפדפן, דרך הפרוקסי same-origin (/api/admin/*).
// כל קריאה נושאת את ה-Bearer token מ-localStorage. ה-backend אוכף role=staff/admin.
"use client";

import type {
  Candidate,
  CandidateDetail,
  CandidateListItem,
  CandidateStatus,
  CallLog,
  Contact,
  DashboardSummary,
  Employer,
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
} from "@/types";

const TOKEN_KEY = "ds_token";

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
/** סימון פנייה כטופלה / ביטול — מחזיר את הפנייה המעודכנת. */
export const setContactHandled = (id: string, handled: boolean) =>
  adminFetch<Contact>(`contact/${id}/handled`, {
    method: "PATCH",
    body: { handled },
  });

// ---- מועמדים ----
export const listCandidates = () =>
  adminFetch<CandidateListItem[]>("candidates");
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
export const listEmployers = () => adminFetch<Employer[]>("employers");
export const createEmployer = (body: {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessNumber?: string;
  address?: string;
  notes?: string;
}) => adminFetch<Employer>("employers", { method: "POST", body });

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
