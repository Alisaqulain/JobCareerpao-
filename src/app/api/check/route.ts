import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { runHealthChecks } from "@/lib/services/health.service";

export async function GET(request: NextRequest) {
  try {
    const live = request.nextUrl.searchParams.get("live") !== "false";
    const report = await runHealthChecks(live);
    return successResponse(report, report.ok ? "All checks passed" : "Some checks failed", report.ok ? 200 : 503);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Health check failed", 500);
  }
}
