// lib/api.ts — קריאות ל-backend (NestJS).
// ה-frontend לא ניגש ל-DB ישירות — הכל עובר דרך כאן.
// בצד שרת משתמשים ב-BACKEND_API_URL; בצד לקוח ב-NEXT_PUBLIC_API_URL.

import type {
  PublicJob,
  JobField,
  Region,
  PublicTestimonial,
  PublicAd,
  AdPlacement,
} from "@/types";

// מוריד סלאש מיותר בסוף הכתובת כדי שלא ייווצר `//api/...`
const BASE_URL = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

/** עוטף את ApiResponse<T> של ה-backend ומחזיר את ה-data. */
async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    data?: T;
    error?: string;
  } | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? "שגיאה בתקשורת עם השרת");
  }
  return json.data as T;
}

// ה-backend מחזיר descriptionPublic/openedAt; ה-UI עובד עם PublicJob (description/createdAt).
interface RawPublicJob {
  id: string;
  title: string;
  descriptionPublic: string;
  field: JobField;
  region: Region;
  scope: string;
  experience?: string | null;
  openedAt: string;
  featured?: boolean;
}

/** ממיר את צורת ה-backend לצורת ה-UI (PublicJob). */
function toPublicJob(raw: RawPublicJob): PublicJob {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.descriptionPublic,
    field: raw.field,
    region: raw.region,
    scope: raw.scope,
    experience: raw.experience ?? null,
    createdAt: raw.openedAt,
    featured: raw.featured ?? false,
  };
}

export interface JobsFilter {
  field?: JobField;
  region?: Region;
  experience?: string;
}

/** לוח המשרות הציבורי. נכשל בעדינות — מחזיר [] אם ה-backend לא זמין. */
export async function getPublicJobs(
  filter: JobsFilter = {},
): Promise<PublicJob[]> {
  const params = new URLSearchParams();
  if (filter.field) params.set("field", filter.field);
  if (filter.region) params.set("region", filter.region);
  if (filter.experience) params.set("experience", filter.experience);

  try {
    const res = await fetch(`${BASE_URL}/api/jobs?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    const raw = await unwrap<RawPublicJob[]>(res);
    return raw.map(toPublicJob);
  } catch {
    return [];
  }
}

/** רשימת ערים/אזורים קיימים (לרשימות בחירה). נכשל בעדינות — [] אם אין תקשורת. */
export async function getRegions(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/regions`, {
      next: { revalidate: 60 },
    });
    return await unwrap<string[]>(res);
  } catch {
    return [];
  }
}

/** משרה ציבורית בודדת (null אם לא נמצאה / שגיאה). */
export async function getPublicJob(id: string): Promise<PublicJob | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/${id}`, {
      next: { revalidate: 60 },
    });
    return toPublicJob(await unwrap<RawPublicJob>(res));
  } catch {
    return null;
  }
}

/** הגשת מועמדות (מהדפדפן). */
export async function submitApplication(
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await unwrap<unknown>(res);
}

/** המלצות לקוחות מפורסמות — לדף הבית. נכשל בעדינות → [] אם אין תקשורת. */
export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/testimonials`, {
      next: { revalidate: 60 },
    });
    return await unwrap<PublicTestimonial[]>(res);
  } catch {
    return [];
  }
}

/** מודעות חסות חיות למיקום נתון. נכשל בעדינות → [] אם אין תקשורת. */
export async function getPublicAds(
  placement: AdPlacement,
): Promise<PublicAd[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/advertisements/public?placement=${placement}`,
      { next: { revalidate: 60 } },
    );
    return await unwrap<PublicAd[]>(res);
  } catch {
    return [];
  }
}
