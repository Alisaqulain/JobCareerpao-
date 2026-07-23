import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { handleWebhookEvent } from "@/lib/services/payment.service";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) return errorResponse("Missing signature", 400);

    const rawBody = await request.text();
    const result = await handleWebhookEvent(rawBody, signature);
    logger.info("Razorpay webhook processed", result);
    return successResponse(result);
  } catch (err) {
    logger.error("Webhook error", { error: String(err) });
    return errorResponse(err instanceof Error ? err.message : "Webhook failed", 400);
  }
}
