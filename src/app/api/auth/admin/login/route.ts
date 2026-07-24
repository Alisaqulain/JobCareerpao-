import { NextRequest } from "next/server";
import { signIn } from "@/lib/auth/config";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { adminLoginSchema } from "@/lib/validations";
import { loginAdmin, serializeAdmin } from "@/lib/services/auth.service";
import { parseJsonBody } from "@/lib/auth/helpers";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const body = await parseJsonBody(request);
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    let admin;
    try {
      admin = await loginAdmin(parsed.data.email, parsed.data.password);
    } catch {
      return errorResponse("Invalid admin email or password", 401);
    }

    const serialized = serializeAdmin(admin);

    await signIn("otp-verified", {
      id: serialized.id,
      email: serialized.email,
      name: serialized.name,
      role: serialized.role,
      profileComplete: "true",
      redirect: false,
    });

    return successResponse(serialized, "Admin login successful");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Admin login failed", 400);
  }
}
