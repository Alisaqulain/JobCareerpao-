export type UserRole = "user" | "admin";

export type JobStatus = "active" | "inactive" | "archived";

export type ApplicationStatus = "pending" | "selected" | "rejected";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded" | "cancelled";

export type RefundStatus = "none" | "pending" | "processed" | "failed";

export type OtpPurpose = "signup" | "login" | "reset";

export type DynamicFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "number"
  | "file";

export interface DynamicField {
  id: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
  grade?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalUsers: number;
  totalApplications: number;
  todayApplications: number;
  revenue: number;
  pendingApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
  totalCompanies: number;
  totalBlogs: number;
  publishedBlogs: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileComplete?: boolean;
}
