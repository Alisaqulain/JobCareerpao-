import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { companySchema, paginationSchema, formatZodError } from "@/lib/validations";
import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/lib/services/company.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 50, order: "asc" as const };

    const { companies, pagination } = await listCompanies({
      page: query.page,
      limit: query.limit,
      search: query.search,
      admin: true,
      sort: query.sort,
      order: query.order,
    });

    return successResponse(companies, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch companies", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(formatZodError(parsed.error), 400);
    }

    const company = await createCompany(parsed.data as unknown as Record<string, unknown>);
    return successResponse(company, "Company created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create company", 400);
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
    if (!parsed.success) {
      return errorResponse(formatZodError(parsed.error), 400);
    }

    const company = await updateCompany(companyId, parsed.data as Record<string, unknown>);
    return successResponse(company, "Company updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update company", 400);
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
    return errorResponse(err instanceof Error ? err.message : "Failed to delete company", 400);
  }
}
