import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getCompanyById, getCompanyJobs } from "@/lib/services/company.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyById(id);
    const jobs = await getCompanyJobs(id);
    return successResponse({ company, jobs });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Company not found", 404);
  }
}
