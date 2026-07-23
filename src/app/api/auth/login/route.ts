import { NextRequest } from "next/server";
import { signIn } from "@/lib/auth/config";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { loginSchema, adminLoginSchema } from "@/lib/validations";
import { serializeUser } from "@/lib/services/auth.service";
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const result = await signIn("user-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (!result || (typeof result === "object" && "error" in result && result.error)) {
      return errorResponse("Invalid email or password", 401);
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) return errorResponse("User not found", 404);

    return successResponse(serializeUser(user), "Login successful");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Login failed", 400);
  }
}
