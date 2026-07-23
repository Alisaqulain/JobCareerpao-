import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser } from "@/lib/auth/helpers";
import {
  uploadResume,
  uploadProfileImage,
  validateResumeFile,
} from "@/lib/services/cloudinary.service";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { deleteCloudinaryAsset } from "@/lib/services/cloudinary.service";
import { sanitizeFilename } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "resume";

    if (!file) return errorResponse("No file provided", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = sanitizeFilename(`${user!.id}_${Date.now()}_${file.name}`);

    await connectDB();
    const dbUser = await User.findById(user!.id);
    if (!dbUser) return errorResponse("User not found", 404);

    if (type === "profile") {
      const result = await uploadProfileImage(buffer, filename);
      if (dbUser.profilePicturePublicId) {
        await deleteCloudinaryAsset(dbUser.profilePicturePublicId, "image");
      }
      dbUser.profilePicture = result.url;
      dbUser.profilePicturePublicId = result.publicId;
      await dbUser.save();
      return successResponse({ url: result.url, publicId: result.publicId }, "Profile picture uploaded");
    }

    validateResumeFile(file);
    const result = await uploadResume(buffer, filename);
    if (dbUser.resumePublicId) {
      await deleteCloudinaryAsset(dbUser.resumePublicId, "raw");
    }
    dbUser.resumeUrl = result.url;
    dbUser.resumePublicId = result.publicId;
    await dbUser.save();

    return successResponse({ url: result.url, publicId: result.publicId }, "Resume uploaded");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Upload failed", 400);
  }
}
