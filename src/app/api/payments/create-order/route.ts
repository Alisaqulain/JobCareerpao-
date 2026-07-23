import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { createOrderSchema } from "@/lib/validations";
import { createPaymentOrder } from "@/lib/services/payment.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { user, error } = await requireUser();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const order = await createPaymentOrder({
      userId: user!.id,
      ...parsed.data,
    });

    return successResponse(order, "Payment order created");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Order creation failed", 400);
  }
}
