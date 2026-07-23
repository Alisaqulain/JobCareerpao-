import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { verifyPaymentSchema } from "@/lib/validations";
import { verifyAndSubmitApplication } from "@/lib/services/payment.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { user, error } = await requireUser();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const result = await verifyAndSubmitApplication({
      userId: user!.id,
      ...parsed.data,
    });

    return successResponse(
      {
        application: result.application,
        payment: result.payment,
        alreadyProcessed: result.alreadyProcessed,
      },
      result.alreadyProcessed ? "Already processed" : "Application submitted successfully"
    );
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment verification failed", 400);
  }
}
