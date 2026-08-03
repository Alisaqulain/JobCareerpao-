import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser, parseJsonBody } from "@/lib/auth/helpers";
import { profileUpdateSchema } from "@/lib/validations";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { validateCsrfOrigin } from "@/lib/utils/crypto";
import { canGenerateProfileResume, hasMinimumApplyProfile } from "@/lib/resume/profile";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  await connectDB();
  const profile = await User.findById(user!.id).select("-password").lean();
  if (!profile) return errorResponse("User not found", 404);

  const profileComplete = hasMinimumApplyProfile(profile);
  const canGenerateResume = canGenerateProfileResume(profile);

  return successResponse({ ...profile, profileComplete, canGenerateResume });
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
    const existing = await User.findById(user!.id);
    if (!existing) return errorResponse("User not found", 404);

    const update = parsed.data;
    const merged = {
      name: update.name ?? existing.name,
      phone: update.phone ?? existing.phone,
      skills: update.skills ?? existing.skills,
      education: update.education ?? existing.education,
      experience: update.experience ?? existing.experience,
    };
    const profileComplete = hasMinimumApplyProfile(merged);
    const canGenerateResume = canGenerateProfileResume(merged);

    existing.set({ ...update, profileComplete });
    await existing.save();

    const profile = existing.toObject();
    delete (profile as { password?: string }).password;

    return successResponse({ ...profile, profileComplete, canGenerateResume }, "Profile updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
  }
}
