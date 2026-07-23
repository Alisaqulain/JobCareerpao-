import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { Job } from "@/models/Job";
import { Blog } from "@/models/Blog";
import { Company } from "@/models/Company";
import { blogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://jobcareerpao.com";
  const staticRoutes = ["", "/jobs", "/blog", "/about", "/contact", "/faq", "/companies", "/careers", "/privacy", "/terms", "/refund"].map(
    (path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })
  );

  try {
    await connectDB();
    const [jobs, blogs, companies] = await Promise.all([
      Job.find({ status: "active" }).select("_id updatedAt").lean(),
      Blog.find({ status: "published" }).select("slug updatedAt").lean(),
      Company.find({ isActive: true }).select("_id updatedAt").lean(),
    ]);

    return [
      ...staticRoutes,
      ...jobs.map((j) => ({
        url: `${base}/jobs/${j._id}`,
        lastModified: j.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      })),
      ...(blogs.length
        ? blogs.map((b) => ({
            url: `${base}/blog/${b.slug}`,
            lastModified: b.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : blogPosts.map((b) => ({
            url: `${base}/blog/${b.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))),
      ...companies.map((c) => ({
        url: `${base}/companies/${c._id}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
