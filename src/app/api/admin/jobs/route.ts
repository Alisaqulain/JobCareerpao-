import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { createJobBodySchema, paginationSchema, updateJobSchema, formatZodError } from "@/lib/validations";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
  duplicateJob,
  toggleJobStatus,
  checkArchiveReady,
} from "@/lib/services/job.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

    const { jobs, pagination } = await listJobs({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      sort: query.sort,
      order: query.order,
      admin: true,
    });

    return successResponse(jobs, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch jobs", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = createJobBodySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(formatZodError(parsed.error), 400);
    }

    const job = await createJob(parsed.data as unknown as Record<string, unknown>);
    return successResponse(job, "Job created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create job", 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const jobId = body.jobId as string | undefined;
    const action = body.action as string | undefined;

    if (!jobId) return errorResponse("jobId is required", 400);

    if (action === "duplicate") {
      const job = await duplicateJob(jobId);
      return successResponse(job, "Job duplicated");
    }

    if (action === "enable") {
      const job = await toggleJobStatus(jobId, "active");
      return successResponse(job, "Job enabled");
    }

    if (action === "disable") {
      const job = await toggleJobStatus(jobId, "inactive");
      return successResponse(job, "Job disabled");
    }

    if (action === "archive-check") {
      const result = await checkArchiveReady(jobId);
      return successResponse(result);
    }

    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(formatZodError(parsed.error), 400);
    }

    const job = await updateJob(jobId, parsed.data as unknown as Record<string, unknown>);
    return successResponse(job, "Job updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update job", 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { error } = await requireAdmin();
    if (error) return error;

    const jobId = request.nextUrl.searchParams.get("jobId");
    if (!jobId) return errorResponse("jobId is required", 400);

    await deleteJob(jobId);
    return successResponse(null, "Job deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete job", 400);
  }
}
