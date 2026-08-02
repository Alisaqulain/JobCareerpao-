import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import type { ApplicationStatus } from "@/types";
import { getPagination, parseSort } from "@/lib/utils/crypto";
import { sendApplicationStatusEmail } from "@/lib/services/email.service";

export async function listApplications(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobId?: string;
  companyName?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  userId?: string;
  paymentStatus?: string;
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { paymentStatus: params.paymentStatus || "paid" };
  if (params.status) filter.status = params.status;
  if (params.jobId) filter.jobId = params.jobId;
  if (params.companyName) {
    filter.companyName = { $regex: params.companyName, $options: "i" };
  }
  if (params.userId) filter.userId = params.userId;
  if (params.dateFrom || params.dateTo) {
    filter.appliedDate = {};
    if (params.dateFrom) {
      (filter.appliedDate as Record<string, Date>).$gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      (filter.appliedDate as Record<string, Date>).$lte = new Date(params.dateTo);
    }
  }

  if (params.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
      ],
    }).select("_id");
    filter.userId = { $in: users.map((u) => u._id) };
  }

  const sort = parseSort(params.sort || "appliedDate", params.order || "desc");
  const query = Application.find(filter)
    .populate("userId", "name email phone education experience skills languages address")
    .populate("jobId", "title company applicationFee companyId")
    .sort(sort);

  const [applications, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ]);

  return { applications, pagination: getPagination(page, limit, total) };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminNotes?: string
) {
  await connectDB();
  const application = await Application.findById(applicationId)
    .populate("userId", "name email")
    .populate("jobId", "title");
  if (!application) throw new Error("Application not found");

  const prevStatus = application.status;
  application.status = status === "pending" ? "applied" : status;
  if (status === "archived") {
    application.archivedAt = new Date();
  }
  if (adminNotes !== undefined) application.adminNotes = adminNotes;
  await application.save();

  if (prevStatus !== application.status) {
    const user = application.userId as unknown as { name: string; email: string };
    const job = application.jobId as unknown as { title: string };
    if (user?.email && ["selected", "rejected"].includes(application.status)) {
      await sendApplicationStatusEmail(
        user.email,
        user.name,
        job.title,
        application.status === "selected" ? "selected" : "rejected"
      );
    }
  }

  return application;
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: ApplicationStatus,
  adminNotes?: string
) {
  const results = [];
  for (const id of applicationIds) {
    results.push(await updateApplicationStatus(id, status, adminNotes));
  }
  return results;
}

export async function getUserApplications(userId: string) {
  await connectDB();
  return Application.find({ userId, paymentStatus: "paid" })
    .populate("jobId", "title company location status applicationFee lastDate")
    .sort({ appliedDate: -1 })
    .lean();
}

export async function findExportableApplications(params: {
  applicationIds?: string[];
  exportAll?: boolean;
}) {
  await connectDB();

  const filter: Record<string, unknown> = { paymentStatus: "paid" };

  if (params.applicationIds?.length) {
    filter._id = { $in: params.applicationIds };
  } else if (!params.exportAll) {
    throw new Error("Nothing selected for export");
  }

  return Application.find(filter)
    .populate("userId", "name email phone education experience skills languages address")
    .populate("jobId", "title company")
    .sort({ appliedDate: -1 })
    .lean();
}

export async function findArchivedApplications(params: {
  applicationIds?: string[];
  exportAll?: boolean;
  filters?: {
    jobId?: string;
    companyName?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  };
}) {
  const filter: Record<string, unknown> = {
    paymentStatus: "paid",
    status: "archived",
  };

  if (params.applicationIds?.length) {
    filter._id = { $in: params.applicationIds };
  } else if (!params.exportAll) {
    throw new Error("Select applications or choose export all for archived records");
  }

  if (params.filters?.jobId) filter.jobId = params.filters.jobId;
  if (params.filters?.companyName) {
    filter.companyName = { $regex: params.filters.companyName, $options: "i" };
  }
  if (params.filters?.dateFrom || params.filters?.dateTo) {
    filter.appliedDate = {};
    if (params.filters.dateFrom) {
      (filter.appliedDate as Record<string, Date>).$gte = new Date(params.filters.dateFrom);
    }
    if (params.filters.dateTo) {
      (filter.appliedDate as Record<string, Date>).$lte = new Date(params.filters.dateTo);
    }
  }

  if (params.filters?.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: params.filters.search, $options: "i" } },
        { email: { $regex: params.filters.search, $options: "i" } },
        { phone: { $regex: params.filters.search, $options: "i" } },
      ],
    }).select("_id");
    filter.userId = { $in: users.map((u) => u._id) };
  }

  await connectDB();
  return Application.find(filter)
    .populate("userId", "name email phone education experience skills languages address")
    .populate("jobId", "title company")
    .sort({ appliedDate: -1 })
    .lean();
}
