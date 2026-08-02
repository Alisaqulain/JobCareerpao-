import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Application } from "@/models/Application";
import { uploadResume, deleteCloudinaryAsset } from "@/lib/services/cloudinary.service";
import { generateProfilePdfBuffer } from "@/lib/resume/generate-pdf";
import { buildProfileSnapshot, type ResumePayload } from "@/lib/resume/profile";
import { sanitizeFilename } from "@/lib/utils/crypto";
import type { ResumeType } from "@/types";

export async function uploadApplicationResume(params: {
  userId: string;
  jobId: string;
  buffer: Buffer;
  filename: string;
}) {
  const folder = `applications/${params.userId}/${params.jobId}`;
  const safeName = sanitizeFilename(params.filename);
  return uploadResume(params.buffer, safeName, folder);
}

export async function generateApplicationResume(params: {
  userId: string;
  jobId: string;
  applicationNumber: string;
}) {
  await connectDB();
  const user = await User.findById(params.userId);
  if (!user) throw new Error("User not found");

  const snapshot = buildProfileSnapshot(user);
  const pdfBuffer = await generateProfilePdfBuffer(snapshot);
  const filename = sanitizeFilename(`${params.applicationNumber}_profile.pdf`);

  const upload = await uploadApplicationResume({
    userId: params.userId,
    jobId: params.jobId,
    buffer: pdfBuffer,
    filename,
  });

  return {
    ...upload,
    snapshot,
    resumeType: "generated" as ResumeType,
  };
}

export async function resolveApplicationResume(params: {
  userId: string;
  jobId: string;
  applicationNumber: string;
  resume: ResumePayload;
}) {
  if (params.resume.resumeType === "generated") {
    return generateApplicationResume({
      userId: params.userId,
      jobId: params.jobId,
      applicationNumber: params.applicationNumber,
    });
  }

  if (!params.resume.resumeUrl || !params.resume.resumePublicId) {
    throw new Error("Uploaded resume is missing. Please upload again before paying.");
  }

  await connectDB();
  const user = await User.findById(params.userId);
  if (!user) throw new Error("User not found");

  return {
    url: params.resume.resumeUrl,
    publicId: params.resume.resumePublicId,
    format: "pdf",
    bytes: 0,
    snapshot: buildProfileSnapshot(user),
    resumeType: "uploaded" as ResumeType,
  };
}

export async function deleteApplicationResume(publicId?: string) {
  if (!publicId) return false;
  return deleteCloudinaryAsset(publicId, "raw");
}
