import { connectDB } from "@/lib/db/mongoose";
import { PlatformAnalytics } from "@/models/PlatformAnalytics";
import type { ApplicationStatus } from "@/types";

export async function getOrCreatePlatformAnalytics() {
  await connectDB();
  let analytics = await PlatformAnalytics.findOne({ key: "global" });
  if (!analytics) {
    analytics = await PlatformAnalytics.create({ key: "global" });
  }
  return analytics;
}

export async function incrementApplicationsAllTime(count = 1) {
  await connectDB();
  await PlatformAnalytics.findOneAndUpdate(
    { key: "global" },
    { $inc: { totalApplicationsAllTime: count } },
    { upsert: true, new: true }
  );
}

export async function recordDeletedApplications(params: {
  count: number;
  statusBreakdown: Record<string, number>;
  resumesDeleted: number;
}) {
  await connectDB();
  const inc: Record<string, number> = {
    archivedApplicationsDeleted: params.count,
    deletedResumes: params.resumesDeleted,
  };

  for (const [status, value] of Object.entries(params.statusBreakdown)) {
    inc[`deletedByStatus.${status}`] = value;
  }

  await PlatformAnalytics.findOneAndUpdate(
    { key: "global" },
    { $inc: inc, $set: { lastCleanupAt: new Date() } },
    { upsert: true }
  );
}

export async function getAnalyticsSummary() {
  const analytics = await getOrCreatePlatformAnalytics();
  return {
    totalApplicationsAllTime: analytics.totalApplicationsAllTime,
    archivedApplicationsDeleted: analytics.archivedApplicationsDeleted,
    deletedByStatus: analytics.deletedByStatus || {},
    deletedResumes: analytics.deletedResumes,
    lastCleanupAt: analytics.lastCleanupAt,
  };
}

export function tallyStatusBreakdown(
  applications: Array<{ status: ApplicationStatus | string }>
) {
  return applications.reduce<Record<string, number>>((acc, app) => {
    const status = app.status === "pending" ? "applied" : app.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}
