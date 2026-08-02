import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin } from "@/lib/auth/helpers";
import { uploadImage } from "@/lib/services/cloudinary.service";
import { sanitizeFilename } from "@/lib/utils/crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "company";

    if (!file) return errorResponse("No file provided", 400);
    if (!ALLOWED.includes(file.type)) return errorResponse("Only JPEG, PNG, WebP, GIF allowed", 400);
    if (file.size > MAX_SIZE) return errorResponse("Image must be 5MB or smaller", 400);

    const folder =
      type === "blog" ? "blogs" : type === "company-banner" ? "companies/banners" : "companies";
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = sanitizeFilename(`${user!.id}_${Date.now()}_${file.name}`);

    const transforms =
      type === "company-banner"
        ? [{ width: 1600, height: 480, crop: "fill" as const }]
        : [{ width: 1200, height: 1200, crop: "limit" as const }];
    const result = await uploadImage(buffer, filename, folder, transforms);

    return successResponse(
      { url: result.url, publicId: result.publicId },
      "Image uploaded"
    );
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Upload failed", 400);
  }
}
