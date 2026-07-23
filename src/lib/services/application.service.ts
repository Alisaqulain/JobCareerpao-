import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { sendApplicationStatusEmail } from "@/lib/services/email.service";
import { getPagination, parseSort } from "@/lib/utils/crypto";

export async function listApplications(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobId?: string;
  sort?: string;
  order?: "asc" | "desc";
  userId?: string;
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.jobId) filter.jobId = params.jobId;
  if (params.userId) filter.userId = params.userId;

  let query = Application.find(filter)
    .populate("userId", "name email phone education experience skills")
    .populate("jobId", "title company applicationFee")
    .sort(parseSort(params.sort || "appliedDate", params.order));

  if (params.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
      ],
    }).select("_id");
    filter.userId = { $in: users.map((u) => u._id) };
    query = Application.find(filter)
      .populate("userId", "name email phone education experience skills")
      .populate("jobId", "title company applicationFee")
      .sort(parseSort(params.sort || "appliedDate", params.order));
  }

  const [applications, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ]);

  return { applications, pagination: getPagination(page, limit, total) };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "pending" | "selected" | "rejected",
  adminNotes?: string
) {
  await connectDB();
  const application = await Application.findById(applicationId)
    .populate("userId", "name email")
    .populate("jobId", "title");
  if (!application) throw new Error("Application not found");

  const prevStatus = application.status;
  application.status = status;
  if (adminNotes !== undefined) application.adminNotes = adminNotes;
  await application.save();

  if (prevStatus !== status) {
    const user = application.userId as unknown as { name: string; email: string };
    const job = application.jobId as unknown as { title: string };
    if (user?.email) {
      await sendApplicationStatusEmail(user.email, user.name, job.title, status);
    }
  }

  return application;
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: "pending" | "selected" | "rejected",
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
  return Application.find({ userId })
    .populate("jobId", "title company location status applicationFee lastDate")
    .sort({ appliedDate: -1 })
    .lean();
}

export async function exportApplicationsCsv(applications: Array<Record<string, unknown>>) {
  const headers = ["Name", "Email", "Job", "Company", "Status", "Applied Date"];
  const rows = applications.map((a) => {
    const user = a.userId as { name?: string; email?: string };
    const job = a.jobId as { title?: string; company?: string };
    return [
      user?.name || "",
      user?.email || "",
      job?.title || "",
      job?.company || "",
      a.status,
      a.appliedDate ? new Date(String(a.appliedDate)).toISOString() : "",
    ];
  });
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

export async function exportApplicationsExcel(applications: Array<Record<string, unknown>>) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications");
  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Email", key: "email", width: 28 },
    { header: "Job", key: "job", width: 24 },
    { header: "Company", key: "company", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Applied Date", key: "appliedDate", width: 22 },
  ];
  for (const a of applications) {
    const user = a.userId as { name?: string; email?: string };
    const job = a.jobId as { title?: string; company?: string };
    sheet.addRow({
      name: user?.name || "",
      email: user?.email || "",
      job: job?.title || "",
      company: job?.company || "",
      status: a.status,
      appliedDate: a.appliedDate ? new Date(String(a.appliedDate)).toISOString() : "",
    });
  }
  return workbook.xlsx.writeBuffer();
}
