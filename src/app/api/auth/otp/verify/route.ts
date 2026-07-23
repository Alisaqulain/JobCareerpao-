import { NextRequest } from "next/server";
import { signIn } from "@/lib/auth/config";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { verifyOtpSchema } from "@/lib/validations";
import { registerUserWithOtp, serializeUser } from "@/lib/services/auth.service";
import { verifyOtpCode } from "@/lib/services/otp.service";
import { parseJsonBody } from "@/lib/auth/helpers";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const body = await parseJsonBody(request);
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const { email, otp, purpose, name, phone, password } = parsed.data;

    if (purpose === "signup") {
      const user = await registerUserWithOtp({ email, otp, name, phone, password });
      const serialized = serializeUser(user);

      await signIn("otp-verified", {
        id: serialized.id,
        email: serialized.email,
        name: serialized.name,
        role: serialized.role,
        profileComplete: String(serialized.profileComplete),
        redirect: false,
      });

      return successResponse(serialized, "Account verified successfully");
    }

    if (purpose === "login") {
      await verifyOtpCode({ email, otp, purpose: "login" });
      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return errorResponse("User not found", 404);

      const serialized = serializeUser(user);
      await signIn("otp-verified", {
        id: serialized.id,
        email: serialized.email,
        name: serialized.name,
        role: serialized.role,
        profileComplete: String(serialized.profileComplete),
        redirect: false,
      });

      return successResponse(serialized, "Login successful");
    }

    await verifyOtpCode({ email, otp, purpose: "reset" });
    return successResponse({ verified: true }, "OTP verified. You can reset your password.");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "OTP verification failed", 400);
  }
}
