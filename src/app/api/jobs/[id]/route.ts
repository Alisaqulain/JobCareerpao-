import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getJobById, getRelatedJobs } from "@/lib/services/job.service";
import { getSessionUser } from "@/lib/auth/helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    const isAdmin = session?.role === "admin";
    const job = await getJobById(id, isAdmin);
    const companyId = (job as Record<string, unknown>).companyId as
      | { _id?: string }
      | string
      | undefined;
    const cid =
      typeof companyId === "object" && companyId?._id
        ? String(companyId._id)
        : typeof companyId === "string"
          ? companyId
          : undefined;
    const related = await getRelatedJobs(id, cid);
    return successResponse({ job, related });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Job not found", 404);
  }
}
