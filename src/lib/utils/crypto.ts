import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getPagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getMonthLabels(months = 6): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("en-IN", { month: "short", year: "2-digit" }));
  }
  return labels;
}

export function parseSort(sort?: string, order: "asc" | "desc" = "desc") {
  const field = sort || "createdAt";
  return { [field]: order === "asc" ? 1 : -1 } as Record<string, 1 | -1>;
}

export function validateCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;

  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) return true;
    if (appUrl && originHost === new URL(appUrl).host) return true;
  } catch {
    return false;
  }

  return false;
}
