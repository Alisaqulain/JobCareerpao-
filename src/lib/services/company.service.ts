import { connectDB } from "@/lib/db/mongoose";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import { getPagination, parseSort } from "@/lib/utils/crypto";
import { deleteCloudinaryAsset } from "@/lib/services/cloudinary.service";
import {
  COMPANY_CATEGORIES,
  COMPANY_SIZES,
  HIRING_STATUSES,
  VERIFICATION_STATUSES,
  type CompanyCategory,
  type CompanySize,
  type HiringStatus,
  type VerificationStatus,
} from "@/lib/constants/companies";
import mongoose from "mongoose";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugifyCompany(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let slug = slugifyCompany(base);
  if (!slug) slug = "company";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const filter: Record<string, unknown> = { slug: candidate };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: excludeId };
    }
    const existing = await Company.findOne(filter).select("_id").lean();
    if (!existing) return candidate;
    suffix += 1;
  }
}

async function assertUniqueName(name: string, excludeId?: string) {
  const filter: Record<string, unknown> = {
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
  };
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: excludeId };
  }
  const existing = await Company.findOne(filter).select("_id name").lean();
  if (existing) throw new Error(`Company "${name}" already exists`);
}

async function attachOpenJobCounts<T extends { _id: unknown }>(companies: T[]) {
  const companyIds = companies.map((c) => c._id);
  const jobCounts =
    companyIds.length > 0
      ? await Job.aggregate<{ _id: typeof companyIds[number]; openJobs: number }>([
          {
            $match: {
              companyId: { $in: companyIds },
              status: "active",
              lastDate: { $gte: new Date() },
            },
          },
          { $group: { _id: "$companyId", openJobs: { $sum: 1 } } },
        ])
      : [];

  const countMap = new Map(jobCounts.map((entry) => [String(entry._id), entry.openJobs]));
  return companies.map((c) => ({
    ...c,
    openJobs: countMap.get(String(c._id)) || 0,
    totalJobs: countMap.get(String(c._id)) || 0,
  }));
}

function parseCategory(value: unknown): CompanyCategory {
  const category = String(value || "Others");
  return COMPANY_CATEGORIES.includes(category as CompanyCategory)
    ? (category as CompanyCategory)
    : "Others";
}

function parseCompanySize(value: unknown): CompanySize | undefined {
  if (!value) return undefined;
  const size = String(value);
  return COMPANY_SIZES.includes(size as CompanySize) ? (size as CompanySize) : undefined;
}

function parseHiringStatus(value: unknown): HiringStatus {
  const status = String(value || "active");
  return HIRING_STATUSES.includes(status as HiringStatus) ? (status as HiringStatus) : "active";
}

function parseVerificationStatus(value: unknown): VerificationStatus {
  const status = String(value || "pending");
  return VERIFICATION_STATUSES.includes(status as VerificationStatus)
    ? (status as VerificationStatus)
    : "pending";
}

function normalizeCompanyPayload(data: Record<string, unknown>) {
  const name = String(data.name || "").trim();
  const headOffice = String(data.headOffice || data.headquarters || "").trim();

  return {
    name,
    logoUrl: data.logoUrl as string | undefined,
    logoPublicId: data.logoPublicId as string | undefined,
    bannerUrl: data.bannerUrl as string | undefined,
    bannerPublicId: data.bannerPublicId as string | undefined,
    category: parseCategory(data.category),
    industry: String(data.industry || data.category || "General"),
    description: String(data.description || ""),
    website: data.website as string | undefined,
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    hrContactPerson: data.hrContactPerson as string | undefined,
    headOffice,
    headquarters: headOffice,
    city: String(data.city || "").trim(),
    state: String(data.state || "").trim(),
    country: String(data.country || "India").trim(),
    pincode: data.pincode as string | undefined,
    foundedYear: data.foundedYear as string | undefined,
    companySize: parseCompanySize(data.companySize),
    hiringStatus: parseHiringStatus(data.hiringStatus),
    verificationStatus: parseVerificationStatus(data.verificationStatus),
    metaTitle: data.metaTitle as string | undefined,
    metaDescription: data.metaDescription as string | undefined,
    color: (data.color as string) || "#0B4F8A",
    isActive: data.isActive !== false,
  };
}

export async function listCompanies(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  industry?: string;
  city?: string;
  state?: string;
  hiringStatus?: string;
  verificationStatus?: string;
  isActive?: boolean;
  admin?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (!params.admin) {
    filter.isActive = true;
    filter.hiringStatus = "active";
    filter.verificationStatus = "verified";
  } else {
    if (params.isActive !== undefined) filter.isActive = params.isActive;
    if (params.hiringStatus) filter.hiringStatus = params.hiringStatus;
    if (params.verificationStatus) filter.verificationStatus = params.verificationStatus;
  }

  if (params.search) filter.$text = { $search: params.search };
  if (params.category) filter.category = params.category;
  if (params.industry) filter.industry = { $regex: params.industry, $options: "i" };
  if (params.city) filter.city = { $regex: params.city, $options: "i" };
  if (params.state) filter.state = { $regex: params.state, $options: "i" };

  const sort = parseSort(params.sort || "createdAt", params.order || "desc");
  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ]);

  const withCounts = await attachOpenJobCounts(companies);

  return { companies: withCounts, pagination: getPagination(page, limit, total) };
}

export async function getCompanyByIdOrSlug(idOrSlug: string, admin = false) {
  await connectDB();

  let company = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? await Company.findById(idOrSlug).lean()
    : null;

  if (!company) {
    company = await Company.findOne({ slug: idOrSlug }).lean();
  }

  if (!company) throw new Error("Company not found");

  if (
    !admin &&
    (!company.isActive || company.hiringStatus !== "active" || company.verificationStatus !== "verified")
  ) {
    throw new Error("Company not found");
  }

  const [openJobs, totalJobs] = await Promise.all([
    Job.countDocuments({
      companyId: company._id,
      status: "active",
      lastDate: { $gte: new Date() },
    }),
    Job.countDocuments({ companyId: company._id }),
  ]);

  return {
    ...company,
    headOffice: company.headOffice || company.headquarters,
    openJobs,
    totalJobs,
  };
}

export async function getCompanyById(id: string) {
  return getCompanyByIdOrSlug(id, false);
}

export async function getCompanyBySlug(slug: string) {
  return getCompanyByIdOrSlug(slug, false);
}

export async function createCompany(data: Record<string, unknown>) {
  await connectDB();
  const payload = normalizeCompanyPayload(data);
  if (!payload.name) throw new Error("Company name is required");

  await assertUniqueName(payload.name);
  const slug = await ensureUniqueSlug(payload.name);

  const company = await Company.create({
    ...payload,
    slug,
  });

  return company;
}

async function replaceCloudinaryAsset(
  oldPublicId: string | undefined,
  newPublicId: string | undefined
) {
  if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
    await deleteCloudinaryAsset(oldPublicId, "image");
  }
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  await connectDB();
  const company = await Company.findById(id);
  if (!company) throw new Error("Company not found");

  const payload = normalizeCompanyPayload({ ...company.toObject(), ...data });

  if (payload.name && payload.name !== company.name) {
    await assertUniqueName(payload.name, id);
    company.name = payload.name;
    company.slug = await ensureUniqueSlug(payload.name, id);
  }

  if (data.logoUrl !== undefined) {
    await replaceCloudinaryAsset(company.logoPublicId, payload.logoPublicId);
    company.logoUrl = payload.logoUrl;
    company.logoPublicId = payload.logoPublicId;
  }

  if (data.bannerUrl !== undefined) {
    await replaceCloudinaryAsset(company.bannerPublicId, payload.bannerPublicId);
    company.bannerUrl = payload.bannerUrl;
    company.bannerPublicId = payload.bannerPublicId;
  }

  company.category = payload.category;
  company.industry = payload.industry;
  company.description = payload.description;
  company.website = payload.website;
  company.email = payload.email;
  company.phone = payload.phone;
  company.hrContactPerson = payload.hrContactPerson;
  company.headOffice = payload.headOffice;
  company.headquarters = payload.headOffice;
  company.city = payload.city;
  company.state = payload.state;
  company.country = payload.country;
  company.pincode = payload.pincode;
  company.foundedYear = payload.foundedYear;
  company.companySize = payload.companySize;
  company.hiringStatus = payload.hiringStatus;
  company.verificationStatus = payload.verificationStatus;
  company.metaTitle = payload.metaTitle;
  company.metaDescription = payload.metaDescription;
  company.color = payload.color;
  company.isActive = payload.isActive;

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
  if (jobCount > 0) {
    throw new Error("Cannot delete company with linked jobs. Remove or reassign jobs first.");
  }

  if (company.logoPublicId) await deleteCloudinaryAsset(company.logoPublicId, "image");
  if (company.bannerPublicId) await deleteCloudinaryAsset(company.bannerPublicId, "image");

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
    if (!company.isActive || company.hiringStatus !== "active") {
      throw new Error("Selected company is not accepting applications");
    }
    return { companyId: company._id, company: company.name };
  }
  if (companyName) {
    const company = await Company.findOne({ name: companyName.trim() });
    if (company) return { companyId: company._id, company: company.name };
    return { companyId: undefined, company: companyName.trim() };
  }
  throw new Error("Company is required");
}
