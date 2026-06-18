import type { MetadataRoute } from "next";
import { getPublicJobs } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";

// sitemap.xml — נוצר אוטומטית ב-/sitemap.xml.
// כולל את הדפים הציבוריים הקבועים + עמוד לכל משרה פעילה (נמשכות מה-backend).
// getPublicJobs נכשל בעדינות (מחזיר []), כך שה-sitemap תמיד תקף גם אם הבק לא זמין.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/jobs", priority: 0.9 },
    { path: "/employers", priority: 0.8 },
    { path: "/employers/terms", priority: 0.6 },
    { path: "/employers/contact", priority: 0.6 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority,
  }));

  const jobs = await getPublicJobs();
  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: new Date(job.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...jobRoutes];
}
