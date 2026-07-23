export interface CompanyPopulated {
  _id?: string;
  name?: string;
  logoUrl?: string;
  color?: string;
  slug?: string;
}

export interface JobWithCompany {
  company?: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: CompanyPopulated | string | null;
}

export function getJobLogoProps(job: JobWithCompany) {
  const populated =
    job.companyId && typeof job.companyId === "object" ? job.companyId : null;

  const name = populated?.name || job.company || "Company";
  const logoUrl = job.companyLogo || populated?.logoUrl;
  const color = job.companyColor || populated?.color || "#0B4F8A";
  const fallback = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { name, logoUrl, fallback, color };
}

export function getCompanyIdString(job: JobWithCompany): string | undefined {
  if (!job.companyId) return undefined;
  if (typeof job.companyId === "string") return job.companyId;
  return job.companyId._id;
}
