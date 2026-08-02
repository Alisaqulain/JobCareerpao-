import { ZipArchive } from "archiver";
import { PassThrough } from "stream";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { Archive } from "@/models/Archive";
import { Payment } from "@/models/Payment";
import {
  downloadFromCloudinary,
  deleteMultipleAssets,
} from "@/lib/services/cloudinary.service";
import { findExportableApplications } from "@/lib/services/application.service";
import {
  recordDeletedApplications,
  tallyStatusBreakdown,
} from "@/lib/services/analytics.service";
import { sanitizeFilename } from "@/lib/utils/crypto";

function formatEducation(education: Array<{ degree?: string; institution?: string; year?: number }>) {
  if (!education?.length) return "";
  return education
    .map((e) => `${e.degree || ""} - ${e.institution || ""} (${e.year || ""})`)
    .join("; ");
}

function formatExperience(
  experience: Array<{ title?: string; company?: string; current?: boolean }>
) {
  if (!experience?.length) return "";
  return experience
    .map((e) => `${e.title || ""} @ ${e.company || ""}${e.current ? " (Current)" : ""}`)
    .join("; ");
}

function applicantFolderName(name: string, id: string) {
  return sanitizeFilename(`${name || "applicant"}_${id.slice(-6)}`);
}

async function createZipFromApplications(
  applications: Array<Record<string, unknown>>,
  zipBasename: string
) {
  const csvRows = [
    [
      "Name",
      "Email",
      "Phone",
      "Job",
      "Company",
      "Education",
      "Experience",
      "Payment",
      "Application Date",
      "Status",
      "Resume Type",
      "Application Number",
    ].join(","),
  ];

  const passThrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.pipe(passThrough);

  const chunks: Buffer[] = [];
  passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    passThrough.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const app of applications) {
    const user = app.userId as {
      name: string;
      email: string;
      phone: string;
      education: Array<{ degree?: string; institution?: string; year?: number }>;
      experience: Array<{ title?: string; company?: string; current?: boolean }>;
    };
    const job = app.jobId as { title?: string; company?: string } | undefined;
    const folder = applicantFolderName(user?.name || "applicant", String(app._id));
    const resumeFilename = "Resume.pdf";

    csvRows.push(
      [
        `"${user?.name || ""}"`,
        `"${user?.email || ""}"`,
        `"${user?.phone || ""}"`,
        `"${app.jobTitle || job?.title || ""}"`,
        `"${app.companyName || job?.company || ""}"`,
        `"${formatEducation(user?.education)}"`,
        `"${formatExperience(user?.experience)}"`,
        `"${app.paymentStatus}"`,
        `"${new Date(String(app.appliedDate)).toISOString()}"`,
        `"${app.status}"`,
        `"${app.resumeType || "uploaded"}"`,
        `"${app.applicationNumber || ""}"`,
      ].join(",")
    );

    if (app.profileSnapshot) {
      archive.append(JSON.stringify(app.profileSnapshot, null, 2), {
        name: `${folder}/profile.json`,
      });
    }

    archive.append(
      JSON.stringify(
        {
          applicationNumber: app.applicationNumber,
          status: app.status,
          paymentStatus: app.paymentStatus,
          appliedDate: app.appliedDate,
          jobTitle: app.jobTitle || job?.title,
          companyName: app.companyName || job?.company,
          formAnswers: app.formAnswers,
          adminNotes: app.adminNotes,
        },
        null,
        2
      ),
      { name: `${folder}/application.json` }
    );

    if (app.coverLetter) {
      archive.append(String(app.coverLetter), { name: `${folder}/cover_letter.txt` });
    }

    if (app.resumeUrl) {
      try {
        const buffer = await downloadFromCloudinary(String(app.resumeUrl));
        archive.append(buffer, { name: `${folder}/${resumeFilename}` });
      } catch {
        archive.append(Buffer.from("Resume download failed"), {
          name: `${folder}/resume.error.txt`,
        });
      }
    }
  }

  archive.append(csvRows.join("\n"), { name: "Applicants.csv" });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applicants");
  sheet.addRow([
    "Name",
    "Email",
    "Phone",
    "Job",
    "Company",
    "Payment",
    "Application Date",
    "Status",
    "Resume Type",
    "Application Number",
  ]);
  for (const app of applications) {
    const user = app.userId as { name?: string; email?: string; phone?: string };
    const job = app.jobId as { title?: string; company?: string } | undefined;
    sheet.addRow([
      user?.name,
      user?.email,
      user?.phone,
      app.jobTitle || job?.title,
      app.companyName || job?.company,
      app.paymentStatus,
      new Date(String(app.appliedDate)).toISOString(),
      app.status,
      app.resumeType,
      app.applicationNumber,
    ]);
  }
  const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  archive.append(excelBuffer, { name: "Applicants.xlsx" });

  await archive.finalize();
  const buffer = await archivePromise;
  return { buffer, count: applications.length, zipBasename };
}

export async function buildArchiveZip(jobId: string): Promise<Buffer> {
  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  const applications = await Application.find({ jobId, paymentStatus: "paid" })
    .populate("userId", "name email phone education experience")
    .lean();

  const { buffer } = await createZipFromApplications(
    applications as unknown as Array<Record<string, unknown>>,
    sanitizeFilename(job.title)
  );
  return buffer;
}

export async function buildApplicationsExportZip(params: {
  applicationIds?: string[];
  exportAll?: boolean;
}) {
  const applications = await findExportableApplications(params);
  if (!applications.length) {
    throw new Error("No applications found to export");
  }

  const { buffer, count } = await createZipFromApplications(
    applications as unknown as Array<Record<string, unknown>>,
    "applications-export"
  );

  return { buffer, count, applicationIds: applications.map((a) => String(a._id)) };
}

export async function deleteExportedApplications(params: {
  applicationIds: string[];
  adminId: string;
  adminEmail: string;
}) {
  await connectDB();

  const applications = await Application.find({
    _id: { $in: params.applicationIds },
    paymentStatus: "paid",
  });

  if (!applications.length) {
    throw new Error("No applications found to delete");
  }

  const publicIds = applications.map((a) => a.resumePublicId).filter(Boolean) as string[];
  let resumesDeleted = 0;
  if (publicIds.length) {
    const result = await deleteMultipleAssets(publicIds);
    resumesDeleted = result.deleted;
  }

  const statusBreakdown = tallyStatusBreakdown(applications);
  const deletedCount = applications.length;
  const ids = applications.map((a) => a._id);

  await Application.deleteMany({ _id: { $in: ids } });

  await recordDeletedApplications({
    count: deletedCount,
    statusBreakdown,
    resumesDeleted,
  });

  const jobTitles = [...new Set(applications.map((a) => a.jobTitle).filter(Boolean))];
  await Archive.create({
    jobId: applications[0]?.jobId,
    jobTitle: jobTitles.join(", ") || "Multiple jobs",
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    applicationsDeleted: deletedCount,
    downloadedBy: params.adminEmail,
    resumesDeleted,
  });

  return { deletedCount, resumesDeleted };
}

export async function confirmArchiveAndDelete(params: {
  jobId: string;
  adminId: string;
  adminEmail: string;
}) {
  await connectDB();
  const job = await Job.findById(params.jobId);
  if (!job) throw new Error("Job not found");

  await Application.updateMany(
    { jobId: params.jobId, paymentStatus: "paid", status: { $ne: "archived" } },
    { status: "archived", archivedAt: new Date() }
  );

  const applications = await Application.find({
    jobId: params.jobId,
    paymentStatus: "paid",
    status: "archived",
  });

  const publicIds = applications.map((a) => a.resumePublicId).filter(Boolean) as string[];
  let resumesDeleted = 0;
  if (publicIds.length) {
    const result = await deleteMultipleAssets(publicIds);
    resumesDeleted = result.deleted;
  }

  const deletedCount = applications.length;
  await Application.deleteMany({ _id: { $in: applications.map((a) => a._id) } });

  await recordDeletedApplications({
    count: deletedCount,
    statusBreakdown: tallyStatusBreakdown(applications),
    resumesDeleted,
  });

  await Job.findByIdAndUpdate(params.jobId, {
    isArchived: true,
    status: "archived",
  });

  await Archive.create({
    jobId: params.jobId,
    jobTitle: job.title,
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    applicationsDeleted: deletedCount,
    downloadedBy: params.adminEmail,
    resumesDeleted,
  });

  return { deletedCount, resumesDeleted };
}

export async function exportApplicationsCsv(applications: Array<Record<string, unknown>>) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Job",
    "Company",
    "Payment",
    "Applied Date",
    "Status",
    "Resume URL",
  ];
  const rows = applications.map((app) => {
    const user = app.userId as { name?: string; email?: string; phone?: string };
    const job = app.jobId as { title?: string; company?: string };
    return [
      user?.name || "",
      user?.email || "",
      user?.phone || "",
      app.jobTitle || job?.title || "",
      app.companyName || job?.company || "",
      app.paymentStatus,
      app.appliedDate,
      app.status,
      app.resumeUrl,
    ];
  });
  return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
}

export async function exportApplicationsExcel(applications: Array<Record<string, unknown>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications");
  sheet.addRow([
    "Name",
    "Email",
    "Phone",
    "Job",
    "Company",
    "Payment",
    "Applied Date",
    "Status",
    "Resume URL",
  ]);
  for (const app of applications) {
    const user = app.userId as { name?: string; email?: string; phone?: string };
    const job = app.jobId as { title?: string; company?: string };
    sheet.addRow([
      user?.name,
      user?.email,
      user?.phone,
      app.jobTitle || job?.title,
      app.companyName || job?.company,
      app.paymentStatus,
      app.appliedDate,
      app.status,
      app.resumeUrl,
    ]);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function getArchiveManagerStats() {
  await connectDB();
  const [archivedCount, totalPaidApplications, totalPayments] = await Promise.all([
    Application.countDocuments({ status: "archived", paymentStatus: "paid" }),
    Application.countDocuments({ paymentStatus: "paid" }),
    Payment.countDocuments({ status: "paid" }),
  ]);

  return { archivedCount, totalPaidApplications, totalPayments };
}
