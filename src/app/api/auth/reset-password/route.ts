import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/auth/helpers";
import { validateCsrfOrigin, hashPassword } from "@/lib/utils/crypto";
import { verifyOtpCode } from "@/lib/services/otp.service";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const body = await parseJsonBody(request);
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    await verifyOtpCode({
      email: parsed.data.email,
      otp: parsed.data.otp,
      purpose: "reset",
    });

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+password");
    if (!user) return errorResponse("User not found", 404);

    user.password = await hashPassword(parsed.data.password);
    await user.save();

    return successResponse(null, "Password reset successful. You can login now.");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Reset failed", 400);
  }
}
