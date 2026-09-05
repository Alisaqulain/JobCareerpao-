import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { createPaymentLinkForOrder } from "@/lib/services/payment.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { user, error } = await requireUser();
    if (error) return error;

    const body = (await parseJsonBody(request)) as { orderId?: string; jobId?: string };
    const orderId = String(body.orderId || "");
    const jobId = String(body.jobId || "");
    if (!orderId || !jobId) {
      return errorResponse("orderId and jobId are required", 400);
    }

    await connectDB();
    const profile = await User.findById(user!.id).select("name email phone").lean();
    if (!profile) return errorResponse("User not found", 404);

    const link = await createPaymentLinkForOrder({
      orderId,
      userId: user!.id,
      jobId,
      customer: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
      },
    });

    return successResponse(link, "Payment link created");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Could not create payment link", 400);
  }
}
