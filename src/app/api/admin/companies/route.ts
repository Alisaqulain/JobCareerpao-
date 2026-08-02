import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { companySchema, formatZodError } from "@/lib/validations";
import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/lib/services/company.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { getErrorMessage } from "@/lib/utils/errors";

function parseAdminListParams(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  return {
    page: params.page ? Number(params.page) : 1,
    limit: params.limit ? Number(params.limit) : 50,
    search: params.search,
    sort: params.sort,
    order: (params.order as "asc" | "desc") || "desc",
    category: params.category,
    city: params.city,
    state: params.state,
    hiringStatus: params.hiringStatus,
    verificationStatus: params.verificationStatus,
    isActive:
      params.isActive === "true" ? true : params.isActive === "false" ? false : undefined,
    admin: true as const,
  };
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { companies, pagination } = await listCompanies(parseAdminListParams(request));
    return successResponse(companies, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to fetch companies"), 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) return errorResponse(formatZodError(parsed.error), 400);

    const company = await createCompany(parsed.data as unknown as Record<string, unknown>);
    return successResponse(company, "Company created", 201);
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to create company"), 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const companyId = body.companyId as string | undefined;
    if (!companyId) return errorResponse("companyId is required", 400);

    const parsed = companySchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(formatZodError(parsed.error), 400);

    const company = await updateCompany(companyId, parsed.data as Record<string, unknown>);
    return successResponse(company, "Company updated");
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to update company"), 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const companyId = request.nextUrl.searchParams.get("companyId");
    if (!companyId) return errorResponse("companyId is required", 400);

    await deleteCompany(companyId);
    return successResponse(null, "Company deleted");
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to delete company"), 400);
  }
}
