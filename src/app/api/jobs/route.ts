import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { paginationSchema } from "@/lib/validations";
import { listJobs, getJobById } from "@/lib/services/job.service";
import { requireAdmin } from "@/lib/auth/helpers";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

    const { jobs, pagination } = await listJobs({
      page: query.page,
      limit: query.limit,
      search: query.search,
      location: params.location,
      jobType: params.jobType,
      mode: params.mode,
      company: params.company,
      companyId: params.companyId,
      experience: params.experience,
      salaryMin: params.salaryMin ? Number(params.salaryMin) : undefined,
      salaryMax: params.salaryMax ? Number(params.salaryMax) : undefined,
      category: params.category,
      sort: query.sort,
      order: query.order,
      admin: false,
    });

    return successResponse(jobs, undefined, 200, pagination);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch jobs", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  return errorResponse("Use /api/admin/jobs to create jobs", 405);
}
