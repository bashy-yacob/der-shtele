import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// robots.txt — נוצר אוטומטית ב-/robots.txt.
// מאשר את כל האזור הציבורי; חוסם אזורים פרטיים, API וקבצים מקומיים.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/api/",
        "/auth",
        "/login",
        "/register",
        "/apply",
        "/uploads/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
