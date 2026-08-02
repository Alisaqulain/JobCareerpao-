import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { companySchema, paginationSchema, formatZodError } from "@/lib/validations";
import { listCompanies, createCompany } from "@/lib/services/company.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { getErrorMessage } from "@/lib/utils/errors";

function parseListParams(request: NextRequest, admin = false) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = paginationSchema.safeParse(params);
  const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

  return {
    page: query.page,
    limit: query.limit,
    search: query.search,
    sort: query.sort,
    order: query.order,
    category: params.category,
    industry: params.industry,
    city: params.city,
    state: params.state,
    hiringStatus: params.hiringStatus,
    verificationStatus: params.verificationStatus,
    isActive:
      params.isActive === "true" ? true : params.isActive === "false" ? false : undefined,
    admin,
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = parseListParams(request, false);
    const { companies, pagination } = await listCompanies(params);
    return successResponse(companies, undefined, 200, pagination, 60);
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Failed to fetch companies"), 500);
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
