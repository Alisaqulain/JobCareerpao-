import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { profileUpdateSchema } from "@/lib/validations";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  await connectDB();
  const profile = await User.findById(user!.id).select("-password").lean();
  if (!profile) return errorResponse("User not found", 404);

  const profileComplete = Boolean(
    profile.name &&
      profile.phone &&
      profile.skills?.length &&
      profile.education?.length &&
      profile.experience?.length
  );

  return successResponse({ ...profile, profileComplete });
}

export async function PATCH(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) {
      return errorResponse("Invalid request origin", 403);
    }

    const { user, error } = await requireUser();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    await connectDB();
    const update = parsed.data;
    const profileComplete =
      Boolean(update.name || user!.name) &&
      Boolean(update.phone) &&
      Boolean(update.skills?.length) &&
      Boolean(update.education?.length) &&
      Boolean(update.experience?.length);

    const profile = await User.findByIdAndUpdate(
      user!.id,
      { ...update, profileComplete },
      { new: true, runValidators: true }
    ).select("-password");

    return successResponse(profile, "Profile updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
  }
}
