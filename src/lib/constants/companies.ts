export const COMPANY_CATEGORIES = [
  "IT Company",
  "Hotel",
  "Hospital",
  "Manufacturing",
  "Automobile",
  "Banking",
  "BPO / KPO",
  "Retail",
  "Construction",
  "Government",
  "Education",
  "Aviation",
  "Logistics",
  "Telecom",
  "Pharma",
  "Electronics",
  "FMCG",
  "E-commerce",
  "Others",
] as const;

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const;

export const HIRING_STATUSES = ["active", "inactive"] as const;
export const VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];
export type CompanySize = (typeof COMPANY_SIZES)[number];
export type HiringStatus = (typeof HIRING_STATUSES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
