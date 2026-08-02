import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import {
  deleteMultipleAssets,
  getCloudinaryUsage,
  listRawAssets,
} from "@/lib/services/cloudinary.service";
import {
  getAnalyticsSummary,
  recordDeletedApplications,
  tallyStatusBreakdown,
} from "@/lib/services/analytics.service";
import {
  EXPIRED_JOB_RETENTION_DAYS,
  REJECTED_APPLICATION_RETENTION_DAYS,
} from "@/lib/constants";

async function estimateCollectionBytes(collectionName: string) {
  try {
    const db = mongoose.connection.db;
    if (!db) return 0;
    const stats = (await db.command({ collStats: collectionName })) as { size?: number };
    return stats.size || 0;
  } catch {
    return 0;
  }
}

export async function getStorageDashboard() {
  await connectDB();

  const [
    totalApplications,
    archivedApplications,
    applicationsWithResume,
    generatedResumes,
    uploadedResumes,
    totalJobs,
    expiredJobs,
    rejectedOld,
    totalUsers,
    totalPayments,
    analytics,
    cloudinaryUsage,
  ] = await Promise.all([
    Application.countDocuments({ paymentStatus: "paid" }),
    Application.countDocuments({ status: "archived", paymentStatus: "paid" }),
    Application.countDocuments({ resumePublicId: { $exists: true, $ne: null } }),
    Application.countDocuments({ resumeType: "generated" }),
    Application.countDocuments({ resumeType: "uploaded" }),
    Job.countDocuments(),
    Job.countDocuments({
      status: "active",
      lastDate: {
        $lt: new Date(Date.now() - EXPIRED_JOB_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
    Application.countDocuments({
      status: "rejected",
      appliedDate: {
        $lt: new Date(Date.now() - REJECTED_APPLICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
    User.countDocuments({ role: "user" }),
    Payment.countDocuments({ status: "paid" }),
    getAnalyticsSummary(),
    getCloudinaryUsage(),
  ]);

  const [applicationBytes, userBytes, paymentBytes, jobBytes] = await Promise.all([
    estimateCollectionBytes("applications"),
    estimateCollectionBytes("users"),
    estimateCollectionBytes("payments"),
    estimateCollectionBytes("jobs"),
  ]);

  const referencedPublicIds = new Set(
    (
      await Application.find({ resumePublicId: { $exists: true, $ne: null } })
        .select("resumePublicId")
        .lean()
    ).map((a) => a.resumePublicId as string)
  );

  const legacyProfileResumes = (
    await User.find({ resumePublicId: { $exists: true, $ne: null } }).select("resumePublicId").lean()
  ).map((u) => u.resumePublicId as string);

  const cloudAssets = await listRawAssets("applications", 500);
  const orphanEstimate = cloudAssets.filter((asset) => !referencedPublicIds.has(asset.public_id)).length;

  return {
    mongodb: {
      estimatedBytes: applicationBytes + userBytes + paymentBytes + jobBytes,
      applicationsBytes: applicationBytes,
      usersBytes: userBytes,
      paymentsBytes: paymentBytes,
      jobsBytes: jobBytes,
    },
    cloudinary: cloudinaryUsage,
    counts: {
      totalApplications,
      archivedApplications,
      applicationsWithResume,
      generatedResumes,
      uploadedResumes,
      totalJobs,
      expiredJobs,
      rejectedOld,
      totalUsers,
      totalPayments,
      orphanCloudinaryFiles: orphanEstimate + legacyProfileResumes.length,
      legacyProfileResumes: legacyProfileResumes.length,
    },
    analytics,
  };
}

export async function runStorageCleanup(action: string) {
  await connectDB();

  switch (action) {
    case "delete_rejected":
      return deleteRejectedApplications();
    case "archive_old_rejected":
      return archiveOldRejectedApplications();
    case "delete_expired_jobs":
      return archiveExpiredJobs();
    case "delete_orphans":
      return deleteOrphanCloudinaryFiles();
    case "delete_temp":
      return deleteTempCloudinaryFiles();
    default:
      throw new Error("Unknown cleanup action");
  }
}

async function deleteRejectedApplications() {
  const cutoff = new Date(Date.now() - REJECTED_APPLICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const applications = await Application.find({
    status: "rejected",
    appliedDate: { $lt: cutoff },
  });

  const publicIds = applications.map((a) => a.resumePublicId).filter(Boolean) as string[];
  let resumesDeleted = 0;
  if (publicIds.length) {
    resumesDeleted = (await deleteMultipleAssets(publicIds)).deleted;
  }

  const count = applications.length;
  if (count) {
    await Application.deleteMany({ _id: { $in: applications.map((a) => a._id) } });
    await recordDeletedApplications({
      count,
      statusBreakdown: tallyStatusBreakdown(applications),
      resumesDeleted,
    });
  }

  return { deletedApplications: count, resumesDeleted };
}

async function archiveOldRejectedApplications() {
  const cutoff = new Date(Date.now() - REJECTED_APPLICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await Application.updateMany(
    { status: "rejected", appliedDate: { $lt: cutoff }, archivedAt: { $exists: false } },
    { status: "archived", archivedAt: new Date() }
  );
  return { archivedApplications: result.modifiedCount };
}

async function archiveExpiredJobs() {
  const cutoff = new Date(Date.now() - EXPIRED_JOB_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await Job.updateMany(
    {
      status: "active",
      lastDate: { $lt: cutoff },
    },
    { status: "archived", isArchived: true }
  );
  return { archivedJobs: result.modifiedCount };
}

async function deleteOrphanCloudinaryFiles() {
  const referenced = new Set(
    (
      await Application.find({ resumePublicId: { $exists: true, $ne: null } })
        .select("resumePublicId")
        .lean()
    ).map((a) => a.resumePublicId as string)
  );

  const legacy = (
    await User.find({ resumePublicId: { $exists: true, $ne: null } }).select("resumePublicId").lean()
  ).map((u) => u.resumePublicId as string);
  legacy.forEach((id) => referenced.add(id));

  const assets = [
    ...(await listRawAssets("applications", 500)),
    ...(await listRawAssets("resumes", 500)),
    ...(await listRawAssets("temp", 500)),
  ];

  const orphanIds = assets
    .map((asset) => asset.public_id)
    .filter((id) => !referenced.has(id));

  const result = await deleteMultipleAssets(orphanIds);
  return { orphanCandidates: orphanIds.length, deleted: result.deleted };
}

async function deleteTempCloudinaryFiles() {
  const assets = await listRawAssets("temp", 500);
  const ids = assets.map((asset) => asset.public_id);
  const result = await deleteMultipleAssets(ids);
  return { deleted: result.deleted };
}

export async function runScheduledCleanup() {
  const rejected = await deleteRejectedApplications();
  const jobs = await archiveExpiredJobs();
  const orphans = await deleteOrphanCloudinaryFiles();
  const temp = await deleteTempCloudinaryFiles();

  return { rejected, jobs, orphans, temp };
}
