import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/auth/helpers";
import { newsletterSchema } from "@/lib/validations";
import { sendNewsletterSignupEmail } from "@/lib/services/email.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);

    const body = await parseJsonBody(request);
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Invalid email", 400);
    }

    await sendNewsletterSignupEmail(parsed.data.email);
    return successResponse(null, "Subscribed successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Subscription failed", 500);
  }
}
