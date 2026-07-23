import { connectDB } from "@/lib/db/mongoose";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { Blog } from "@/models/Blog";
import { getPagination, parseSort, startOfToday, endOfToday, getMonthLabels } from "@/lib/utils/crypto";
import { ARCHIVE_APPLICATION_THRESHOLD } from "@/lib/constants";
import { resolveCompanyForJob } from "@/lib/services/company.service";
import type { DashboardStats, ChartDataPoint } from "@/types";

function slugify(title: string, company: string) {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

function attachCompanyLogo(job: Record<string, unknown>) {
  const companyDoc = job.companyId as Record<string, unknown> | null | undefined;
  if (companyDoc && typeof companyDoc === "object" && companyDoc.name) {
    return {
      ...job,
      companyLogo: companyDoc.logoUrl,
      companyColor: companyDoc.color || "#0B4F8A",
      companySlug: companyDoc.slug,
    };
  }
  return job;
}

export async function listJobs(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  location?: string;
  jobType?: string;
  mode?: string;
  company?: string;
  companyId?: string;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  category?: string;
  sort?: string;
  order?: "asc" | "desc";
  admin?: boolean;
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (!params.admin) {
    filter.status = "active";
    filter.lastDate = { $gte: new Date() };
  } else if (params.status) {
    filter.status = params.status;
  }

  if (params.search) {
    filter.$text = { $search: params.search };
  }
  if (params.location) {
    filter.location = { $regex: params.location, $options: "i" };
  }
  if (params.jobType) filter.jobType = params.jobType;
  if (params.mode) filter.mode = params.mode;
  if (params.companyId) filter.companyId = params.companyId;
  if (params.company) filter.company = { $regex: params.company, $options: "i" };
  if (params.experience) filter.experience = { $regex: params.experience, $options: "i" };
  if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
    const salaryFilter: Record<string, number> = {};
    if (params.salaryMin !== undefined) salaryFilter.$gte = params.salaryMin;
    if (params.salaryMax !== undefined) salaryFilter.$lte = params.salaryMax;
    filter["salary.max"] = salaryFilter;
  }
  if (params.category) {
    filter.skills = { $regex: params.category, $options: "i" };
  }

  const sort = parseSort(params.sort, params.order);
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate("companyId", "name logoUrl color slug industry headquarters")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map((j) => attachCompanyLogo(j as unknown as Record<string, unknown>)),
    pagination: getPagination(page, limit, total),
  };
}

export async function getJobById(id: string, admin = false) {
  await connectDB();
  const job = await Job.findById(id)
    .populate("companyId", "name logoUrl color slug industry headquarters website description")
    .lean();
  if (!job) throw new Error("Job not found");
  if (!admin && (job.status !== "active" || new Date(job.lastDate) < new Date())) {
    throw new Error("Job is not available");
  }
  return attachCompanyLogo(job as unknown as Record<string, unknown>);
}

export async function getRelatedJobs(jobId: string, companyId?: string, limit = 4) {
  await connectDB();
  const filter: Record<string, unknown> = {
    _id: { $ne: jobId },
    status: "active",
    lastDate: { $gte: new Date() },
  };
  if (companyId) filter.companyId = companyId;

  const jobs = await Job.find(filter)
    .populate("companyId", "name logoUrl color slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return jobs.map((j) => attachCompanyLogo(j as unknown as Record<string, unknown>));
}

export async function createJob(data: Record<string, unknown>) {
  await connectDB();
  const title = String(data.title);
  const resolved = await resolveCompanyForJob(
    data.companyId as string | undefined,
    data.company as string | undefined
  );
  const slug = slugify(title, resolved.company);
  const job = await Job.create({
    ...data,
    company: resolved.company,
    companyId: resolved.companyId,
    slug,
    applicationCount: 0,
  });
  return Job.findById(job._id)
    .populate("companyId", "name logoUrl color slug")
    .lean();
}

export async function updateJob(id: string, data: Record<string, unknown>) {
  await connectDB();
  const patch = { ...data };
  if (data.companyId || data.company) {
    const resolved = await resolveCompanyForJob(
      data.companyId as string | undefined,
      data.company as string | undefined
    );
    patch.company = resolved.company;
    patch.companyId = resolved.companyId;
  }
  const job = await Job.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
    .populate("companyId", "name logoUrl color slug")
    .lean();
  if (!job) throw new Error("Job not found");
  return attachCompanyLogo(job as unknown as Record<string, unknown>);
}

export async function deleteJob(id: string) {
  await connectDB();
  const job = await Job.findByIdAndDelete(id);
  if (!job) throw new Error("Job not found");
  return job;
}

export async function duplicateJob(id: string) {
  await connectDB();
  const job = await Job.findById(id).lean();
  if (!job) throw new Error("Job not found");
  const { _id, slug, applicationCount, createdAt, updatedAt, ...rest } = job;
  void _id;
  void slug;
  void applicationCount;
  void createdAt;
  void updatedAt;
  return createJob({
    ...rest,
    title: `${rest.title} (Copy)`,
    status: "inactive",
  });
}

export async function toggleJobStatus(id: string, status: "active" | "inactive") {
  return updateJob(id, { status });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [
    totalJobs,
    activeJobs,
    inactiveJobs,
    totalUsers,
    totalApplications,
    todayApplications,
    revenueAgg,
    pendingApplications,
    selectedApplications,
    rejectedApplications,
    totalCompanies,
    totalBlogs,
    publishedBlogs,
  ] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: "active" }),
    Job.countDocuments({ status: "inactive" }),
    User.countDocuments({ role: "user" }),
    Application.countDocuments(),
    Application.countDocuments({ appliedDate: { $gte: todayStart, $lte: todayEnd } }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Application.countDocuments({ status: "pending" }),
    Application.countDocuments({ status: "selected" }),
    Application.countDocuments({ status: "rejected" }),
    Company.countDocuments({ isActive: true }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
  ]);

  return {
    totalJobs,
    activeJobs,
    inactiveJobs,
    totalUsers,
    totalApplications,
    todayApplications,
    revenue: revenueAgg[0]?.total || 0,
    pendingApplications,
    selectedApplications,
    rejectedApplications,
    totalCompanies,
    totalBlogs,
    publishedBlogs,
  };
}

export async function getDashboardCharts() {
  await connectDB();
  const labels = getMonthLabels(6);
  const now = new Date();
  const months = labels.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) };
  });

  const applications: ChartDataPoint[] = [];
  const revenue: ChartDataPoint[] = [];
  const users: ChartDataPoint[] = [];
  const jobs: ChartDataPoint[] = [];

  for (let i = 0; i < months.length; i++) {
    const { start, end } = months[i];
    const [appCount, revAgg, userCount, jobCount] = await Promise.all([
      Application.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Payment.aggregate([
        { $match: { status: "paid", createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ role: "user", createdAt: { $gte: start, $lte: end } }),
      Job.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);
    applications.push({ label: labels[i], value: appCount });
    revenue.push({ label: labels[i], value: revAgg[0]?.total || 0 });
    users.push({ label: labels[i], value: userCount });
    jobs.push({ label: labels[i], value: jobCount });
  }

  const statusBreakdown = await Application.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    applications,
    revenue,
    users,
    jobs,
    statusBreakdown: statusBreakdown.map((s) => ({
      label: s._id,
      value: s.count,
    })),
  };
}

export async function checkArchiveReady(jobId: string) {
  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");
  return {
    ready: job.applicationCount >= ARCHIVE_APPLICATION_THRESHOLD,
    count: job.applicationCount,
    threshold: ARCHIVE_APPLICATION_THRESHOLD,
  };
}
