import { v2 as cloudinary } from "cloudinary";
import { RESUME_ALLOWED_TYPES, RESUME_MAX_SIZE_BYTES } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export function validateResumeFile(file: File) {
  if (!RESUME_ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only PDF, DOC, and DOCX files are allowed");
  }
  if (file.size > RESUME_MAX_SIZE_BYTES) {
    throw new Error("Resume must be 5MB or smaller");
  }
}

export async function uploadResume(
  buffer: Buffer,
  filename: string,
  folder = "applications"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: filename.replace(/\.[^/.]+$/, ""),
        overwrite: false,
        format: "pdf",
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary upload failed", { error: String(error) });
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format || "pdf",
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadProfileImage(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  return uploadImage(buffer, filename, "profiles", [
    { width: 400, height: 400, crop: "fill", gravity: "face" },
  ]);
}

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder: string,
  transformation?: Array<Record<string, unknown>>
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^/.]+$/, ""),
        ...(transformation ? { transformation } : {}),
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary image upload failed", { error: String(error) });
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "raw" | "image" = "raw") {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    logger.error("Cloudinary delete failed", { publicId, error: String(error) });
    return false;
  }
}

export async function downloadFromCloudinary(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteMultipleAssets(publicIds: string[]) {
  if (!publicIds.length) return { deleted: 0 };
  const unique = [...new Set(publicIds.filter(Boolean))];
  const BATCH = 100;
  let deleted = 0;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const result = await cloudinary.api.delete_resources(batch, { resource_type: "raw" });
    deleted += Object.values(result.deleted || {}).filter((v) => v === "deleted").length;
  }
  return { deleted };
}

export async function getCloudinaryUsage() {
  try {
    const usage = await cloudinary.api.usage();
    return {
      credits: usage.credits as { usage?: number; limit?: number; used_percent?: number } | undefined,
      storage: usage.storage as { usage?: number; limit?: number; used_percent?: number } | undefined,
      bandwidth: usage.bandwidth as { usage?: number; limit?: number; used_percent?: number } | undefined,
      resources: usage.resources as number | undefined,
      derived_resources: usage.derived_resources as number | undefined,
    };
  } catch (error) {
    logger.error("Cloudinary usage fetch failed", { error: String(error) });
    return null;
  }
}

export async function listRawAssets(prefix: string, maxResults = 500) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "raw",
      prefix,
      max_results: maxResults,
    });
    return (result.resources || []) as Array<{ public_id: string; bytes?: number }>;
  } catch (error) {
    logger.error("Cloudinary list assets failed", { prefix, error: String(error) });
    return [];
  }
}
