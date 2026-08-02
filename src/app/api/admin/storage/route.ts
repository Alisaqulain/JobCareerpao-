import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { storageCleanupSchema } from "@/lib/validations";
import { getStorageDashboard, runStorageCleanup } from "@/lib/services/storage.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const dashboard = await getStorageDashboard();
    return successResponse(dashboard);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to load storage dashboard", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = storageCleanupSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Confirmation required", 400);
    }

    const result = await runStorageCleanup(parsed.data.action);
    return successResponse(result, "Cleanup completed");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Cleanup failed", 400);
  }
}
