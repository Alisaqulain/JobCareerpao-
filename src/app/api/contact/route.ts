import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/auth/helpers";
import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/services/email.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);

    const body = await parseJsonBody(request);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    await sendContactEmail(parsed.data);
    return successResponse(null, "Message sent successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to send message", 500);
  }
}
