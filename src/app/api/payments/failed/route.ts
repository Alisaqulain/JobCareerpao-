import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { markPaymentFailed } from "@/lib/services/payment.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid request", 400);

    await markPaymentFailed(parsed.data.orderId, parsed.data.reason || "Payment failed", user!.id);
    return successResponse(null, "Payment marked as failed");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed", 400);
  }
}
