import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://jobcareerpao.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/profile/", "/jobs/*/apply"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
