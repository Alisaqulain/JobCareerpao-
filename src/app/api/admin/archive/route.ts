import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody, getSessionUser } from "@/lib/auth/helpers";
import { archiveConfirmSchema } from "@/lib/validations";
import { buildArchiveZip, confirmArchiveAndDelete } from "@/lib/services/archive.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const jobId = request.nextUrl.searchParams.get("jobId");
    if (!jobId) return errorResponse("jobId is required", 400);

    const zipBuffer = await buildArchiveZip(jobId);
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="job-${jobId}-archive.zip"`,
      },
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Archive download failed", 500);
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
    const parsed = archiveConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Confirmation required", 400);
    }

    const sessionUser = await getSessionUser();
    const result = await confirmArchiveAndDelete({
      jobId: parsed.data.jobId,
      adminId: sessionUser!.id,
      adminEmail: sessionUser!.email,
    });

    return successResponse(result, "Archive completed and applications deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Archive failed", 400);
  }
}
