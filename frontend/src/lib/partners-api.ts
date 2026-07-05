// partners-api — קריאות ה-API של סקשן השותפים ("עם מי אנחנו עובדים").
// קובץ נפרד מ-admin-api.ts בכוונה. קריאות הצוות עוברות דרך הפרוקסי same-origin
// (/api/admin/*) עם Bearer token; הקריאה הציבורית עוברת דרך /api/public/partners
// (ללא auth). ה-backend אוכף role=staff/admin על נתיבי הניהול.
"use client";

import type { Partner, PublicPartner } from "@/types";

const TOKEN_KEY = "ds_token";

function token(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

/** עוטף קריאת ניהול לפרוקסי ומחזיר את ה-data; זורק Error בעברית בכשל. */
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

// ---- ציבורי (לקומפוננטת PartnersStrip) ----

/** שותפים פעילים להצגה באתר. נכשל בעדינות → [] אם אין תקשורת. */
export async function getPublicPartners(): Promise<PublicPartner[]> {
  try {
    const res = await fetch("/api/public/partners");
    const json = (await res.json().catch(() => null)) as {
      success: boolean;
      data?: PublicPartner[];
    } | null;
    if (!res.ok || !json?.success || !Array.isArray(json.data)) return [];
    return json.data;
  } catch {
    return [];
  }
}

// ---- ניהול (צוות) ----

export interface PartnerInput {
  partnerName: string;
  logoPath: string;
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const listPartners = () => adminFetch<Partner[]>("partners/admin/all");

export const createPartner = (body: PartnerInput) =>
  adminFetch<Partner>("partners", { method: "POST", body });

export const updatePartner = (id: string, body: Partial<PartnerInput>) =>
  adminFetch<Partner>(`partners/${id}`, { method: "PATCH", body });

export const deletePartner = (id: string) =>
  adminFetch<{ ok: true }>(`partners/${id}`, { method: "DELETE" });

/** העלאת לוגו (multipart) — דרך route ייעודי כי הפרוקסי הגנרי מעביר JSON בלבד. */
export async function uploadPartnerLogo(file: File): Promise<{ path: string }> {
  const t = token();
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch("/api/admin/partner-logo", {
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
    throw new Error(json?.error ?? "שגיאה בהעלאת הלוגו");
  }
  return json.data as { path: string };
}
