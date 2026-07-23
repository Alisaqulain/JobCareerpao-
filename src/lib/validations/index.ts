import { z } from "zod";
import { JOB_TYPES, JOB_STATUSES, APPLICATION_STATUSES } from "@/lib/constants";

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
  skills: z.array(z.string()).max(50).optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  profilePicture: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  certificates: z.array(certificateSchema).optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  company: z.string().min(2).max(200).optional(),
  companyId: z.string().optional(),
  description: z.string().min(10),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default("INR"),
  }),
  experience: z.string().min(1).max(100),
  qualification: z.string().min(1).max(500),
  skills: z.array(z.string()).min(1),
  location: z.string().min(1).max(200),
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
  name: z.string().min(2).max(200),
  logoUrl: z.string().url().optional(),
  logoPublicId: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  headquarters: z.string().min(2).max(200),
  founded: z.string().max(20).optional(),
  employeeCount: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).optional(),
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
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(15).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
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

export const createOrderSchema = z.object({
  jobId: z.string().min(1),
  formAnswers: z.record(z.string(), z.unknown()),
  resumeUrl: z.string().url(),
});

export const verifyPaymentSchema = z.object({
  jobId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  formAnswers: z.record(z.string(), z.unknown()),
  resumeUrl: z.string().url(),
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
