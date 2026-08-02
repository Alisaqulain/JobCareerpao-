import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/utils/api-response";
import { CRON_SECRET } from "@/lib/constants";
import { runScheduledCleanup } from "@/lib/services/storage.service";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await runScheduledCleanup();
    return successResponse(result, "Scheduled cleanup completed");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Cleanup failed", 500);
  }
}
