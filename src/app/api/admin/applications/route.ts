import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import {
  paginationSchema,
  applicationStatusSchema,
  bulkApplicationStatusSchema,
} from "@/lib/validations";
import {
  listApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} from "@/lib/services/application.service";
import {
  exportApplicationsCsv,
  exportApplicationsExcel,
} from "@/lib/services/archive.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import type { ApplicationStatus } from "@/types";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const exportFormat = params.export;

    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

    const { applications, pagination } = await listApplications({
      page: query.page,
      limit: exportFormat ? 10000 : query.limit,
      search: query.search,
      status: query.status,
      jobId: query.jobId,
      sort: query.sort,
      order: query.order,
    });

    if (exportFormat === "csv") {
      const csv = await exportApplicationsCsv(applications as unknown as Array<Record<string, unknown>>);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="applications.csv"',
        },
      });
    }

    if (exportFormat === "excel") {
      const buffer = await exportApplicationsExcel(
        applications as unknown as Array<Record<string, unknown>>
      );
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="applications.xlsx"',
        },
      });
    }

    return successResponse(applications, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch applications", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const bulkParsed = bulkApplicationStatusSchema.safeParse(body);

    if (bulkParsed.success) {
      const results = await bulkUpdateApplicationStatus(
        bulkParsed.data.applicationIds,
        bulkParsed.data.status as ApplicationStatus,
        bulkParsed.data.adminNotes
      );
      return successResponse(results, "Applications updated");
    }

    const applicationId = (body as { applicationId?: string }).applicationId;
    if (!applicationId) return errorResponse("applicationId is required", 400);

    const parsed = applicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const application = await updateApplicationStatus(
      applicationId,
      parsed.data.status as ApplicationStatus,
      parsed.data.adminNotes
    );

    return successResponse(application, "Application status updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
  }
}
