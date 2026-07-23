import { ZipArchive } from "archiver";
import { PassThrough } from "stream";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { Archive } from "@/models/Archive";
import {
  downloadFromCloudinary,
  deleteMultipleAssets,
} from "@/lib/services/cloudinary.service";
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

export async function buildArchiveZip(jobId: string): Promise<Buffer> {
  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  const applications = await Application.find({ jobId })
    .populate("userId", "name email phone education experience")
    .lean();

  const csvRows = [
    [
      "Name",
      "Email",
      "Phone",
      "Education",
      "Experience",
      "Payment",
      "Application Date",
      "Status",
      "Resume Filename",
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
    const user = app.userId as unknown as {
      name: string;
      email: string;
      phone: string;
      education: Array<{ degree?: string; institution?: string; year?: number }>;
      experience: Array<{ title?: string; company?: string; current?: boolean }>;
    };

    const resumeFilename = sanitizeFilename(
      `${user?.name || "applicant"}_${app._id}.pdf`
    );

    csvRows.push(
      [
        `"${user?.name || ""}"`,
        `"${user?.email || ""}"`,
        `"${user?.phone || ""}"`,
        `"${formatEducation(user?.education)}"`,
        `"${formatExperience(user?.experience)}"`,
        `"${app.paymentStatus}"`,
        `"${new Date(app.appliedDate).toISOString()}"`,
        `"${app.status}"`,
        `"${resumeFilename}"`,
      ].join(",")
    );

    if (app.resumeUrl) {
      try {
        const buffer = await downloadFromCloudinary(app.resumeUrl);
        archive.append(buffer, { name: `Applicants/Resumes/${resumeFilename}` });
      } catch {
        archive.append(Buffer.from("Download failed"), {
          name: `Applicants/Resumes/${resumeFilename}.error.txt`,
        });
      }
    }
  }

  archive.append(csvRows.join("\n"), { name: "Applicants/CSV/applicants.csv" });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applicants");
  sheet.addRow([
    "Name",
    "Email",
    "Phone",
    "Education",
    "Experience",
    "Payment",
    "Application Date",
    "Status",
    "Resume Filename",
  ]);
  for (const app of applications) {
    const user = app.userId as unknown as {
      name: string;
      email: string;
      phone: string;
      education: Array<{ degree?: string; institution?: string; year?: number }>;
      experience: Array<{ title?: string; company?: string; current?: boolean }>;
    };
    sheet.addRow([
      user?.name,
      user?.email,
      user?.phone,
      formatEducation(user?.education),
      formatExperience(user?.experience),
      app.paymentStatus,
      new Date(app.appliedDate).toISOString(),
      app.status,
      sanitizeFilename(`${user?.name}_${app._id}.pdf`),
    ]);
  }
  const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  archive.append(excelBuffer, { name: "Applicants/CSV/applicants.xlsx" });

  await archive.finalize();
  return archivePromise;
}

export async function confirmArchiveAndDelete(params: {
  jobId: string;
  adminId: string;
  adminEmail: string;
}) {
  await connectDB();
  const job = await Job.findById(params.jobId);
  if (!job) throw new Error("Job not found");

  const applications = await Application.find({ jobId: params.jobId });
  const publicIds = applications
    .map((a) => a.resumePublicId)
    .filter(Boolean) as string[];

  let resumesDeleted = 0;
  if (publicIds.length) {
    const result = await deleteMultipleAssets(publicIds);
    resumesDeleted = result.deleted;
  }

  const deletedCount = applications.length;
  await Application.deleteMany({ jobId: params.jobId });
  await Job.findByIdAndUpdate(params.jobId, {
    applicationCount: 0,
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
    "Payment",
    "Applied Date",
    "Status",
    "Resume URL",
  ];
  const rows = applications.map((app) => {
    const user = app.userId as { name?: string; email?: string; phone?: string };
    const job = app.jobId as { title?: string };
    return [
      user?.name || "",
      user?.email || "",
      user?.phone || "",
      job?.title || "",
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
    "Payment",
    "Applied Date",
    "Status",
    "Resume URL",
  ]);
  for (const app of applications) {
    const user = app.userId as { name?: string; email?: string; phone?: string };
    const job = app.jobId as { title?: string };
    sheet.addRow([
      user?.name,
      user?.email,
      user?.phone,
      job?.title,
      app.paymentStatus,
      app.appliedDate,
      app.status,
      app.resumeUrl,
    ]);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
