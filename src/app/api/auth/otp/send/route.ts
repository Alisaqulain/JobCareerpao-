import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { sendOtpSchema } from "@/lib/validations";
import { createAndSendOtp } from "@/lib/services/otp.service";
import { rateLimit, getOtpRateLimitKey, getOtpRateLimitConfig } from "@/lib/utils/rate-limit";
import { getClientIp, parseJsonBody } from "@/lib/auth/helpers";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const body = await parseJsonBody(request);
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const ip = getClientIp(request);
    const { max, windowMs } = getOtpRateLimitConfig();
    const limit = rateLimit(getOtpRateLimitKey(parsed.data.email, ip), max, windowMs);
    if (!limit.allowed) {
      return errorResponse("Too many OTP requests. Try again later.", 429);
    }

    const result = await createAndSendOtp(parsed.data);
    return successResponse(result, "OTP sent successfully");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to send OTP", 400);
  }
}
