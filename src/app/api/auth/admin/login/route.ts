import { NextRequest } from "next/server";
import { signIn } from "@/lib/auth/config";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { adminLoginSchema } from "@/lib/validations";
import { serializeAdmin } from "@/lib/services/auth.service";
import { parseJsonBody } from "@/lib/auth/helpers";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { connectDB } from "@/lib/db/mongoose";
import { Admin } from "@/models/Admin";

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

    const result = await signIn("admin-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (!result || (typeof result === "object" && "error" in result && result.error)) {
      return errorResponse("Invalid admin credentials", 401);
    }

    await connectDB();
    const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
    if (!admin) return errorResponse("Admin not found", 404);

    return successResponse(serializeAdmin(admin), "Admin login successful");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Admin login failed", 400);
  }
}
