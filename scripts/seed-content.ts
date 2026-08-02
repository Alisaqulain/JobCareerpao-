import mongoose from "mongoose";
import { companies as staticCompanies, jobs as staticJobs } from "../src/lib/data";
import { blogPosts } from "../src/lib/blog";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);
  const { Company } = await import("../src/models/Company");
  const { Blog } = await import("../src/models/Blog");
  const { Job } = await import("../src/models/Job");

  console.log("Seeding companies...");
  const companyMap = new Map<string, string>();

  for (const c of staticCompanies) {
    const slug = c.id;
    let company = await Company.findOne({ slug });
    if (!company) {
      company = await Company.create({
        name: c.name,
        slug,
        logoUrl: c.logoUrl,
        website: c.domain ? `https://${c.domain}` : undefined,
        category: "IT Company",
        industry: c.industry,
        description: c.description,
        headOffice: c.location,
        headquarters: c.location,
        city: c.location.split(",")[0]?.trim() || c.location,
        state: c.location.split(",")[1]?.trim() || "India",
        country: "India",
        foundedYear: "2000",
        companySize: "1000+",
        color: c.color,
        hiringStatus: "active",
        verificationStatus: "verified",
        isActive: true,
      });
      console.log(`  Created company: ${c.name}`);
    }
    companyMap.set(c.id, String(company._id));
  }

  console.log("Seeding blogs...");
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    const existing = await Blog.findOne({ slug: post.slug });
    if (!existing) {
      await Blog.create({
        title: post.title,
        slug: post.slug,
        category: post.category,
        author: post.author,
        publishedDate: new Date(post.date),
        readingTime: post.readTime,
        tags: [post.category],
        content: post.blocks,
        excerpt: post.excerpt,
        featured: i < 3,
        status: "published",
        seoTitle: post.title,
        seoDescription: post.excerpt,
      });
      console.log(`  Created blog: ${post.title}`);
    }
  }

  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    console.log("Seeding sample jobs...");
    for (const j of staticJobs) {
      const companyId = companyMap.get(j.companyId);
      await Job.create({
        title: j.title,
        company: j.company,
        companyId,
        description: `${j.title} at ${j.company}. Join a leading team and grow your career.`,
        salary: j.salary,
        experience: j.experience,
        qualification: "Bachelor's degree or equivalent",
        skills: j.skills,
        location: j.location,
        jobType: j.type,
        mode: j.mode,
        applicationFee: 99,
        lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
        dynamicFields: [
          { id: "fullName", label: "Full Name", type: "text", required: true },
          { id: "email", label: "Email", type: "email", required: true },
          { id: "phone", label: "Phone", type: "phone", required: true },
        ],
        requiredDocuments: ["Resume"],
        slug: `${j.id}-${Date.now().toString(36)}`,
      });
    }
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
