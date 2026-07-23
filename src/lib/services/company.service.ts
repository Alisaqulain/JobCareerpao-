import { connectDB } from "@/lib/db/mongoose";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import { getPagination, parseSort } from "@/lib/utils/crypto";
import { deleteCloudinaryAsset } from "@/lib/services/cloudinary.service";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCompanies(params: {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  admin?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (!params.admin) filter.isActive = true;
  if (params.search) filter.$text = { $search: params.search };
  if (params.industry) filter.industry = { $regex: params.industry, $options: "i" };

  const sort = parseSort(params.sort || "name", params.order || "asc");
  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ]);

  const withCounts = await Promise.all(
    companies.map(async (c) => {
      const openJobs = await Job.countDocuments({
        companyId: c._id,
        status: "active",
        lastDate: { $gte: new Date() },
      });
      return { ...c, openJobs };
    })
  );

  return { companies: withCounts, pagination: getPagination(page, limit, total) };
}

export async function getCompanyById(id: string) {
  await connectDB();
  const company = await Company.findById(id).lean();
  if (!company || !company.isActive) throw new Error("Company not found");
  const openJobs = await Job.countDocuments({
    companyId: company._id,
    status: "active",
    lastDate: { $gte: new Date() },
  });
  return { ...company, openJobs };
}

export async function getCompanyBySlug(slug: string) {
  await connectDB();
  const company = await Company.findOne({ slug, isActive: true }).lean();
  if (!company) throw new Error("Company not found");
  const openJobs = await Job.countDocuments({
    companyId: company._id,
    status: "active",
    lastDate: { $gte: new Date() },
  });
  return { ...company, openJobs };
}

export async function createCompany(data: Record<string, unknown>) {
  await connectDB();
  const name = String(data.name).trim();
  const slug = slugify(name);
  const existing = await Company.findOne({ $or: [{ name }, { slug }] });
  if (existing) throw new Error("Company already exists");

  const company = await Company.create({
    name,
    slug,
    logoUrl: data.logoUrl as string | undefined,
    logoPublicId: data.logoPublicId as string | undefined,
    website: data.website as string | undefined,
    industry: String(data.industry),
    description: String(data.description),
    headquarters: String(data.headquarters),
    founded: data.founded as string | undefined,
    employeeCount: data.employeeCount as string | undefined,
    color: (data.color as string) || "#0B4F8A",
    isActive: data.isActive !== false,
  });
  return company;
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  await connectDB();
  const company = await Company.findById(id);
  if (!company) throw new Error("Company not found");

  if (data.name && data.name !== company.name) {
    company.name = String(data.name).trim();
    company.slug = slugify(company.name);
  }
  if (data.logoUrl !== undefined) company.logoUrl = data.logoUrl as string | undefined;
  if (data.logoPublicId !== undefined) company.logoPublicId = data.logoPublicId as string | undefined;
  if (data.website !== undefined) company.website = data.website as string | undefined;
  if (data.industry !== undefined) company.industry = String(data.industry);
  if (data.description !== undefined) company.description = String(data.description);
  if (data.headquarters !== undefined) company.headquarters = String(data.headquarters);
  if (data.founded !== undefined) company.founded = data.founded as string | undefined;
  if (data.employeeCount !== undefined) company.employeeCount = data.employeeCount as string | undefined;
  if (data.color !== undefined) company.color = String(data.color);
  if (data.isActive !== undefined) company.isActive = Boolean(data.isActive);

  await company.save();

  if (data.name) {
    await Job.updateMany({ companyId: company._id }, { company: company.name });
  }

  return company;
}

export async function deleteCompany(id: string) {
  await connectDB();
  const company = await Company.findById(id);
  if (!company) throw new Error("Company not found");

  const jobCount = await Job.countDocuments({ companyId: id });
  if (jobCount > 0) throw new Error("Cannot delete company with active jobs");

  if (company.logoPublicId) {
    await deleteCloudinaryAsset(company.logoPublicId, "image");
  }
  await company.deleteOne();
  return company;
}

export async function getCompanyJobs(companyId: string, limit = 20) {
  await connectDB();
  return Job.find({
    companyId,
    status: "active",
    lastDate: { $gte: new Date() },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function resolveCompanyForJob(companyId?: string, companyName?: string) {
  await connectDB();
  if (companyId) {
    const company = await Company.findById(companyId);
    if (!company) throw new Error("Company not found");
    return { companyId: company._id, company: company.name };
  }
  if (companyName) {
    const company = await Company.findOne({ name: companyName.trim() });
    if (company) return { companyId: company._id, company: company.name };
    return { companyId: undefined, company: companyName.trim() };
  }
  throw new Error("Company is required");
}
