import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser } from "@/lib/auth/helpers";
import { getUserApplications } from "@/lib/services/application.service";
import { getUserPayments } from "@/lib/services/payment.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const type = request.nextUrl.searchParams.get("type") || "applications";

  if (type === "payments") {
    const payments = await getUserPayments(user!.id);
    return successResponse(payments);
  }

  const applications = await getUserApplications(user!.id);
  return successResponse(applications);
}

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return errorResponse("Invalid request origin", 403);
  }
  return GET(request);
}
