import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { companySchema, formatZodError } from "@/lib/validations";
import {
  getCompanyByIdOrSlug,
  getCompanyJobs,
  updateCompany,
  deleteCompany,
} from "@/lib/services/company.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { getErrorMessage } from "@/lib/utils/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyByIdOrSlug(id, false);
    const jobs = await getCompanyJobs(String(company._id));
    return successResponse({ company, jobs });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Company not found"), 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    const parsed = companySchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(formatZodError(parsed.error), 400);

    const company = await updateCompany(id, parsed.data as Record<string, unknown>);
    return successResponse(company, "Company updated");
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to update company"), 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await deleteCompany(id);
    return successResponse(null, "Company deleted");
  } catch (err) {
    return errorResponse(getErrorMessage(err, "Failed to delete company"), 400);
  }
}
