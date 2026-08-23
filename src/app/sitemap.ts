import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { Job } from "@/models/Job";
import { Blog } from "@/models/Blog";
import { Company } from "@/models/Company";
import { blogPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${base}/companies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    await connectDB();
    const [jobs, blogs, companies] = await Promise.all([
      Job.find({ status: "active", lastDate: { $gte: now } }).select("slug updatedAt").lean(),
      Blog.find({ status: "published" }).select("slug updatedAt").lean(),
      Company.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    return [
      ...staticRoutes,
      ...jobs.map((j) => ({
        url: `${base}/jobs/${j.slug || j._id}`,
        lastModified: j.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      })),
      ...(blogs.length
        ? blogs.map((b) => ({
            url: `${base}/blog/${b.slug}`,
            lastModified: b.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          }))
        : blogPosts.map((b) => ({
            url: `${base}/blog/${b.slug}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          }))),
      ...companies.map((c) => ({
        url: `${base}/companies/${c.slug || c._id}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
