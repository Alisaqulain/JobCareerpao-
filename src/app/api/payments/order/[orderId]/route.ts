import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser } from "@/lib/auth/helpers";
import { getPaymentOrderDetails } from "@/lib/services/payment.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { orderId } = await params;
    const details = await getPaymentOrderDetails(orderId, user!.id);
    return successResponse(details);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Order not found", 404);
  }
}
