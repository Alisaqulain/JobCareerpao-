import { companies } from "./data";

export type Company = (typeof companies)[number];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getCompanyByName(name: string): Company | undefined {
  return companies.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getCompanyLogoProps(companyId?: string, companyName?: string) {
  const company =
    (companyId && getCompanyById(companyId)) ||
    (companyName && getCompanyByName(companyName));

  if (!company) {
    return {
      name: companyName || "Company",
      logoUrl: undefined,
      fallback: companyName?.charAt(0) || "?",
      color: "#0B4F8A",
    };
  }

  return {
    name: company.name,
    logoUrl: company.logoUrl,
    fallback: company.logo,
    color: company.color,
  };
}
