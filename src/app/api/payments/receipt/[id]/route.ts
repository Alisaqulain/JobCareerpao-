import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, getSessionUser } from "@/lib/auth/helpers";
import { getPaymentReceipt } from "@/lib/services/payment.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const { id } = await params;

    const userId = session?.role === "admin" ? undefined : session?.id;
    if (!session) return errorResponse("Unauthorized", 401);
    if (session.role !== "admin" && session.role !== "user") {
      return errorResponse("Unauthorized", 401);
    }

    const receipt = await getPaymentReceipt(id, userId);
    return successResponse(receipt);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Receipt not found", 404);
  }
}
