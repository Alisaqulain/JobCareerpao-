import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  getDashboardStats,
  getDashboardCharts,
} from "@/lib/services/job.service";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const type = request.nextUrl.searchParams.get("type");

  if (type === "charts") {
    const charts = await getDashboardCharts();
    return successResponse(charts);
  }

  const stats = await getDashboardStats();
  return successResponse(stats);
}
