// portal-api — קריאות פורטל המעסיקים מהדפדפן, דרך הפרוקסי same-origin (/api/portal/*).
// נושא Bearer token מ-localStorage. ה-backend אוכף role=employer ותיחום ל-employerId.
"use client";

import type {
  JobField,
  JobStatus,
  CandidateStatus,
  CommissionStatus,
  PlacementStatus,
} from "@/types";

const TOKEN_KEY = "ds_token";

function token(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

async function portalFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const t = token();
  const headers: Record<string, string> = {};
  if (t) headers.Authorization = `Bearer ${t}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`/api/portal/${path}`, {
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

export interface PortalEmployer {
  id: string;
  companyName: string;
  contactName: string;
  status: "pending" | "approved" | "rejected";
}

export interface PortalJobListItem {
  id: string;
  title: string;
  field: JobField;
  region: string;
  scope: string;
  experience: string | null;
  status: JobStatus;
  openedAt: string;
  createdAt: string;
  _count: { presentations: number };
}

export interface PortalPresentation {
  id: string;
  presentedAt: string;
  status: CandidateStatus;
  candidateLabel: string; // שם מקוצר — ללא פרטי קשר
}

export interface PortalJobDetail {
  id: string;
  title: string;
  field: JobField;
  region: string;
  scope: string;
  experience: string | null;
  salary: string | null;
  status: JobStatus;
  openedAt: string;
  descriptionPublic: string;
  descriptionInternal: string;
  presentations: PortalPresentation[];
}

export interface PortalPlacement {
  id: string;
  placedAt: string;
  guaranteeEndsAt: string;
  status: PlacementStatus;
  commissionAmount: number | null;
  commissionStatus: CommissionStatus;
  job: { title: string } | null;
}

export interface CreatePortalJobInput {
  title: string;
  descriptionPublic: string;
  descriptionInternal: string;
  field: JobField;
  region: string;
  scope: string;
  experience?: string;
  salary?: string;
}

export const getPortalMe = () => portalFetch<PortalEmployer>("me");
export const listPortalJobs = () => portalFetch<PortalJobListItem[]>("jobs");
export const getPortalJob = (id: string) =>
  portalFetch<PortalJobDetail>(`jobs/${id}`);
export const createPortalJob = (body: CreatePortalJobInput) =>
  portalFetch<{ id: string; title: string; status: JobStatus }>("jobs", {
    method: "POST",
    body,
  });
export const updatePortalJob = (
  id: string,
  body: Partial<CreatePortalJobInput> & { status?: JobStatus },
) => portalFetch(`jobs/${id}`, { method: "PATCH", body });
export const listPortalPlacements = () =>
  portalFetch<PortalPlacement[]>("placements");
export const sendPortalMessage = (message: string) =>
  portalFetch("messages", { method: "POST", body: { message } });
