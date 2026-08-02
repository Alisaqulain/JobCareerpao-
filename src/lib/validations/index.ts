import { z } from "zod";
import type { ZodError } from "zod";
import { JOB_TYPES, JOB_STATUSES, APPLICATION_STATUSES } from "@/lib/constants";
import {
  COMPANY_CATEGORIES,
  COMPANY_SIZES,
  HIRING_STATUSES,
  VERIFICATION_STATUSES,
} from "@/lib/constants/companies";

export function formatZodError(error: ZodError): string {
  return error.issues[0]?.message || "Please check your input and try again.";
}

function emptyToUndefined(val: unknown) {
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
}

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

export const dynamicFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
  type: z.enum([
    "text",
    "textarea",
    "email",
    "phone",
    "select",
    "radio",
    "checkbox",
    "date",
    "number",
    "file",
  ]),
  required: z.boolean().default(false),
  placeholder: z.string().max(200).optional(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const sendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["signup", "login", "reset"]).default("signup"),
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  purpose: z.enum(["signup", "login", "reset"]).default("signup"),
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().min(1950).max(new Date().getFullYear() + 5),
  grade: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  year: z.number().min(1950).max(new Date().getFullYear() + 1),
  url: z.string().url().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  address: z
    .object({
      line1: z.string().max(300).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(12).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  languages: z.array(z.string()).max(20).optional(),
  skills: z.array(z.string()).max(50).optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  profilePicture: z.string().url().optional(),
  certificates: z.array(certificateSchema).optional(),
});


export const createOrderSchema = z.object({
  jobId: z.string().min(1),
  formAnswers: z.record(z.string(), z.unknown()),
  resumeType: z.enum(["generated", "uploaded"]),
  resumeUrl: z.string().url().optional(),
  resumePublicId: z.string().optional(),
  coverLetter: z.string().max(5000).optional(),
}).superRefine((data, ctx) => {
  if (data.resumeType === "uploaded" && (!data.resumeUrl || !data.resumePublicId)) {
    ctx.addIssue({
      code: "custom",
      message: "Please upload a resume for this application",
      path: ["resumeUrl"],
    });
  }
});

export const verifyPaymentSchema = createOrderSchema.extend({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const archiveExportSchema = z.object({
  applicationIds: z.array(z.string()).optional(),
  exportAll: z.boolean().optional(),
  filters: z
    .object({
      jobId: z.string().optional(),
      companyName: z.string().optional(),
      status: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
});

export const archiveDeleteSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  confirm: z.literal(true, { message: "Confirmation required" }),
});

export const storageCleanupSchema = z.object({
  action: z.enum([
    "delete_rejected",
    "delete_expired_jobs",
    "delete_orphans",
    "delete_temp",
    "archive_old_rejected",
  ]),
  confirm: z.literal(true, { message: "Confirmation required" }),
});

export const createJobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters").max(200),
  company: z.string().min(2, "Company name must be at least 2 characters").max(200).optional(),
  companyId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default("INR"),
  }),
  experience: z.string().min(1, "Experience is required").max(100),
  qualification: z.string().min(1, "Qualification is required").max(500),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  location: z.string().min(1, "Location is required").max(200),
  jobType: z.enum(JOB_TYPES as unknown as [string, ...string[]]),
  mode: z.enum(["Remote", "Hybrid", "On-site"]).default("Hybrid"),
  applicationFee: z.number().min(0),
  lastDate: z.string().or(z.date()),
  status: z.enum(JOB_STATUSES as unknown as [string, ...string[]]).default("active"),
  dynamicFields: z.array(dynamicFieldSchema).default([]),
  requiredDocuments: z.array(z.string()).default([]),
});

export const createJobBodySchema = createJobSchema.refine((d) => d.companyId || d.company, {
  message: "Company is required",
});

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(200),
  logoUrl: optionalUrl,
  logoPublicId: optionalString,
  bannerUrl: optionalUrl,
  bannerPublicId: optionalString,
  category: z.enum(COMPANY_CATEGORIES as unknown as [string, ...string[]], {
    message: "Select a valid company category",
  }),
  industry: z.string().min(2, "Industry is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  website: optionalUrl,
  email: z.preprocess(emptyToUndefined, z.string().email("Invalid email").optional()),
  phone: optionalString,
  hrContactPerson: optionalString,
  headOffice: z.string().min(2, "Head office address is required").max(300),
  headquarters: optionalString,
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  country: z.string().min(2).max(100).default("India"),
  pincode: optionalString,
  foundedYear: optionalString,
  companySize: z.preprocess(
    emptyToUndefined,
    z.enum(COMPANY_SIZES as unknown as [string, ...string[]]).optional()
  ),
  hiringStatus: z.enum(HIRING_STATUSES as unknown as [string, ...string[]]).default("active"),
  verificationStatus: z
    .enum(VERIFICATION_STATUSES as unknown as [string, ...string[]])
    .default("pending"),
  metaTitle: optionalString,
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(160).optional()),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(3, "Blog title must be at least 3 characters").max(200),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(200).optional(),
  coverImage: z.string().url().optional(),
  coverImagePublicId: z.string().optional(),
  category: z.string().min(2).max(100),
  author: z.string().min(2).max(100),
  publishedDate: z.string().or(z.date()).optional(),
  readingTime: z.string().optional(),
  tags: z.array(z.string()).default([]),
  content: z.array(z.record(z.string(), z.unknown())).default([]),
  excerpt: z.string().min(10).max(500),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  ogImage: z.string().url().optional(),
  relatedPostIds: z.array(z.string()).default([]),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(15).optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const updateJobSchema = createJobSchema.partial();

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES as unknown as [string, ...string[]]),
  adminNotes: z.string().max(2000).optional(),
});

export const bulkApplicationStatusSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  status: z.enum(APPLICATION_STATUSES as unknown as [string, ...string[]]),
  adminNotes: z.string().max(2000).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(),
  jobId: z.string().optional(),
});

export const archiveConfirmSchema = z.object({
  jobId: z.string().min(1),
  confirm: z.literal(true),
});
