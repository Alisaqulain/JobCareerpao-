import type {
  CompanyCategory,
  CompanySize,
  HiringStatus,
  VerificationStatus,
} from "@/lib/constants/companies";

export interface CompanyRecord {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  logoPublicId?: string;
  bannerUrl?: string;
  bannerPublicId?: string;
  category: CompanyCategory | string;
  industry: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  hrContactPerson?: string;
  headOffice?: string;
  headquarters?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  foundedYear?: string;
  companySize?: CompanySize | string;
  hiringStatus: HiringStatus | string;
  verificationStatus: VerificationStatus | string;
  metaTitle?: string;
  metaDescription?: string;
  color: string;
  isActive: boolean;
  openJobs?: number;
  totalJobs?: number;
  createdAt?: string;
}

export interface CompanyFormValues {
  name: string;
  category: CompanyCategory;
  industry: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  hrContactPerson: string;
  headOffice: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  foundedYear: string;
  companySize: CompanySize | "";
  hiringStatus: HiringStatus;
  verificationStatus: VerificationStatus;
  metaTitle: string;
  metaDescription: string;
  logoUrl: string;
  logoPublicId: string;
  bannerUrl: string;
  bannerPublicId: string;
  color: string;
  isActive: boolean;
}

export const emptyCompanyForm = (): CompanyFormValues => ({
  name: "",
  category: "IT Company",
  industry: "",
  description: "",
  website: "",
  email: "",
  phone: "",
  hrContactPerson: "",
  headOffice: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  foundedYear: "",
  companySize: "",
  hiringStatus: "active",
  verificationStatus: "pending",
  metaTitle: "",
  metaDescription: "",
  logoUrl: "",
  logoPublicId: "",
  bannerUrl: "",
  bannerPublicId: "",
  color: "#0B4F8A",
  isActive: true,
});

export function companyToFormValues(company: CompanyRecord): CompanyFormValues {
  return {
    name: company.name,
    category: (company.category as CompanyCategory) || "Others",
    industry: company.industry || "",
    description: company.description || "",
    website: company.website || "",
    email: company.email || "",
    phone: company.phone || "",
    hrContactPerson: company.hrContactPerson || "",
    headOffice: company.headOffice || company.headquarters || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "India",
    pincode: company.pincode || "",
    foundedYear: company.foundedYear || "",
    companySize: (company.companySize as CompanySize) || "",
    hiringStatus: (company.hiringStatus as HiringStatus) || "active",
    verificationStatus: (company.verificationStatus as VerificationStatus) || "pending",
    metaTitle: company.metaTitle || "",
    metaDescription: company.metaDescription || "",
    logoUrl: company.logoUrl || "",
    logoPublicId: company.logoPublicId || "",
    bannerUrl: company.bannerUrl || "",
    bannerPublicId: company.bannerPublicId || "",
    color: company.color || "#0B4F8A",
    isActive: company.isActive !== false,
  };
}

export function formValuesToPayload(form: CompanyFormValues) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    category: form.category,
    industry: form.industry.trim(),
    description: form.description.trim(),
    headOffice: form.headOffice.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    hiringStatus: form.hiringStatus,
    verificationStatus: form.verificationStatus,
    color: form.color,
    isActive: form.isActive,
  };

  if (form.website.trim()) payload.website = form.website.trim();
  if (form.email.trim()) payload.email = form.email.trim();
  if (form.phone.trim()) payload.phone = form.phone.trim();
  if (form.hrContactPerson.trim()) payload.hrContactPerson = form.hrContactPerson.trim();
  if (form.pincode.trim()) payload.pincode = form.pincode.trim();
  if (form.foundedYear.trim()) payload.foundedYear = form.foundedYear.trim();
  if (form.companySize) payload.companySize = form.companySize;
  if (form.metaTitle.trim()) payload.metaTitle = form.metaTitle.trim();
  if (form.metaDescription.trim()) payload.metaDescription = form.metaDescription.trim();
  if (form.logoUrl.trim()) {
    payload.logoUrl = form.logoUrl.trim();
    if (form.logoPublicId.trim()) payload.logoPublicId = form.logoPublicId.trim();
  }
  if (form.bannerUrl.trim()) {
    payload.bannerUrl = form.bannerUrl.trim();
    if (form.bannerPublicId.trim()) payload.bannerPublicId = form.bannerPublicId.trim();
  }

  return payload;
}
