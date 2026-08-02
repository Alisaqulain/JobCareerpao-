import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody, getSessionUser } from "@/lib/auth/helpers";
import { archiveDeleteSchema, paginationSchema } from "@/lib/validations";
import { listApplications } from "@/lib/services/application.service";
import {
  buildApplicationsExportZip,
  deleteExportedApplications,
  getArchiveManagerStats,
} from "@/lib/services/archive.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

    const { applications, pagination } = await listApplications({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order,
    });

    const stats = await getArchiveManagerStats();
    return successResponse({ applications, stats }, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to load data", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const { buffer, count, applicationIds } = await buildApplicationsExportZip({
      exportAll: true,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="jobcareerpao-applications-${Date.now()}.zip"`,
        "X-Exported-Count": String(count),
        "X-Application-Ids": applicationIds.join(","),
      },
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Export failed", 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = archiveDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Confirmation required", 400);
    }

    const sessionUser = await getSessionUser();
    const result = await deleteExportedApplications({
      applicationIds: parsed.data.applicationIds,
      adminId: sessionUser!.id,
      adminEmail: sessionUser!.email,
    });

    return successResponse(result, "Application data deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Delete failed", 400);
  }
}
