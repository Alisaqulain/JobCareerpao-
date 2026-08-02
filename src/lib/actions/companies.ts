"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/helpers";
import { companySchema, formatZodError } from "@/lib/validations";
import {
  createCompany,
  updateCompany,
  deleteCompany,
  listCompanies,
} from "@/lib/services/company.service";
import { getErrorMessage } from "@/lib/utils/errors";
import type { CompanyRecord } from "@/lib/companies/form";

export type CompanyActionResult<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; message: string };

async function assertAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { ok: false as const, message: "Unauthorized" };
  }
  return { ok: true as const, user };
}

function revalidateCompanyPaths(slug?: string) {
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
  if (slug) revalidatePath(`/companies/${slug}`);
}

export async function createCompanyAction(
  payload: Record<string, unknown>
): Promise<CompanyActionResult<CompanyRecord>> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, message: auth.message };

  const parsed = companySchema.safeParse(payload);
  if (!parsed.success) return { success: false, message: formatZodError(parsed.error) };

  try {
    const company = await createCompany(parsed.data as Record<string, unknown>);
    const data = JSON.parse(JSON.stringify(company)) as CompanyRecord;
    revalidateCompanyPaths(data.slug);
    return { success: true, data, message: "Company created" };
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to create company") };
  }
}

export async function updateCompanyAction(
  id: string,
  payload: Record<string, unknown>
): Promise<CompanyActionResult<CompanyRecord>> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, message: auth.message };

  const parsed = companySchema.partial().safeParse(payload);
  if (!parsed.success) return { success: false, message: formatZodError(parsed.error) };

  try {
    const company = await updateCompany(id, parsed.data as Record<string, unknown>);
    const data = JSON.parse(JSON.stringify(company)) as CompanyRecord;
    revalidateCompanyPaths(data.slug);
    return { success: true, data, message: "Company updated" };
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to update company") };
  }
}

export async function deleteCompanyAction(id: string): Promise<CompanyActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, message: auth.message };

  try {
    const company = await deleteCompany(id);
    revalidateCompanyPaths(company.slug);
    return { success: true, message: "Company deleted" };
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to delete company") };
  }
}

export async function listAdminCompaniesAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  state?: string;
  hiringStatus?: string;
  isActive?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}): Promise<
  CompanyActionResult<{
    companies: CompanyRecord[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
  }>
> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, message: auth.message };

  try {
    const { companies, pagination } = await listCompanies({ ...params, admin: true });
    return {
      success: true,
      data: {
        companies: JSON.parse(JSON.stringify(companies)) as CompanyRecord[],
        pagination,
      },
    };
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to fetch companies") };
  }
}
