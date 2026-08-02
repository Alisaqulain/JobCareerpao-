export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const RESUME_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const RESUME_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const ARCHIVE_APPLICATION_THRESHOLD = Number(
  process.env.ARCHIVE_APPLICATION_THRESHOLD || 200
);
export const GST_RATE = Number(process.env.GST_RATE || 0.18);
export const APPLY_GST = process.env.APPLY_GST === "true";
export const PAYMENT_GATEWAY = "razorpay";
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const APPLICATION_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
  "archived",
  "pending",
] as const;

export const RESUME_TYPES = ["generated", "uploaded"] as const;

export const REJECTED_APPLICATION_RETENTION_DAYS = Number(
  process.env.REJECTED_APPLICATION_RETENTION_DAYS || 90
);
export const EXPIRED_JOB_RETENTION_DAYS = Number(process.env.EXPIRED_JOB_RETENTION_DAYS || 180);
export const CRON_SECRET = process.env.CRON_SECRET || "";
export const JOB_STATUSES = ["active", "inactive", "archived"] as const;
export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
] as const;
