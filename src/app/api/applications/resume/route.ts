import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser } from "@/lib/auth/helpers";
import { validateResumeFile } from "@/lib/services/cloudinary.service";
import { uploadApplicationResume } from "@/lib/services/resume.service";
import { sanitizeFilename } from "@/lib/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobId = String(formData.get("jobId") || "");

    if (!file) return errorResponse("No file provided", 400);
    if (!jobId) return errorResponse("jobId is required", 400);

    validateResumeFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = sanitizeFilename(`${user!.id}_${Date.now()}_${file.name}`);

    const result = await uploadApplicationResume({
      userId: user!.id,
      jobId,
      buffer,
      filename,
    });

    return successResponse(
      { url: result.url, publicId: result.publicId, resumeType: "uploaded" },
      "Application resume uploaded"
    );
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Upload failed", 400);
  }
}
