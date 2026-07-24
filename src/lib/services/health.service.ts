import { connectDB } from "@/lib/db/mongoose";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export type HealthStatus = "ok" | "warn" | "error";

export interface HealthCheckItem {
  id: string;
  name: string;
  category: "env" | "service";
  status: HealthStatus;
  message: string;
  detail?: string;
}

export interface HealthReport {
  ok: boolean;
  checkedAt: string;
  summary: { ok: number; warn: number; error: number; total: number };
  checks: HealthCheckItem[];
}

function envSet(key: string): boolean {
  const val = process.env[key];
  return !!val && val.trim().length > 0 && !isPlaceholder(val);
}

function isPlaceholder(val: string): boolean {
  const lower = val.toLowerCase();
  return (
    lower.includes("your_") ||
    lower.includes("xxxxx") ||
    lower.includes("username:password") ||
    lower.includes("your_cloud") ||
    lower.includes("change_me") ||
    lower === "generate-with-openssl-rand-base64-32"
  );
}

function addEnvCheck(
  checks: HealthCheckItem[],
  id: string,
  name: string,
  key: string,
  required = true
) {
  const val = process.env[key];
  if (!val || !val.trim()) {
    checks.push({
      id,
      name,
      category: "env",
      status: required ? "error" : "warn",
      message: required ? "Missing" : "Not set (optional)",
      detail: key,
    });
    return false;
  }
  if (isPlaceholder(val)) {
    checks.push({
      id,
      name,
      category: "env",
      status: "warn",
      message: "Placeholder value — replace with real credentials",
      detail: key,
    });
    return false;
  }
  checks.push({
    id,
    name,
    category: "env",
    status: "ok",
    message: "Configured",
    detail: maskSecret(val),
  });
  return true;
}

function maskSecret(val: string): string {
  if (val.length <= 8) return "••••••••";
  return `${val.slice(0, 4)}••••${val.slice(-4)}`;
}

async function checkMongoDB(): Promise<HealthCheckItem> {
  try {
    await connectDB();
    const state = (await import("mongoose")).default.connection.readyState;
    return {
      id: "mongodb",
      name: "MongoDB Connection",
      category: "service",
      status: state === 1 ? "ok" : "error",
      message: state === 1 ? "Connected successfully" : `Connection state: ${state}`,
    };
  } catch (err) {
    return {
      id: "mongodb",
      name: "MongoDB Connection",
      category: "service",
      status: "error",
      message: "Connection failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkCloudinary(): Promise<HealthCheckItem> {
  if (!envSet("CLOUDINARY_CLOUD_NAME") || !envSet("CLOUDINARY_API_KEY") || !envSet("CLOUDINARY_API_SECRET")) {
    return {
      id: "cloudinary",
      name: "Cloudinary API",
      category: "service",
      status: "error",
      message: "Skipped — credentials missing",
    };
  }
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    await cloudinary.api.ping();
    return {
      id: "cloudinary",
      name: "Cloudinary API",
      category: "service",
      status: "ok",
      message: "API reachable (ping OK)",
      detail: process.env.CLOUDINARY_CLOUD_NAME,
    };
  } catch (err) {
    return {
      id: "cloudinary",
      name: "Cloudinary API",
      category: "service",
      status: "error",
      message: "API check failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkRazorpay(): Promise<HealthCheckItem> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId || !keySecret || isPlaceholder(keyId) || isPlaceholder(keySecret)) {
    return {
      id: "razorpay",
      name: "Razorpay API",
      category: "service",
      status: "error",
      message: "Skipped — credentials missing or placeholder",
    };
  }

  if (publicKey && publicKey !== keyId) {
    return {
      id: "razorpay",
      name: "Razorpay API",
      category: "service",
      status: "warn",
      message: "NEXT_PUBLIC_RAZORPAY_KEY_ID does not match RAZORPAY_KEY_ID",
    };
  }

  try {
    const client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    await client.orders.all({ count: 1 });
    return {
      id: "razorpay",
      name: "Razorpay API",
      category: "service",
      status: "ok",
      message: "Credentials valid — API reachable",
      detail: keyId.startsWith("rzp_live") ? "Live mode" : "Test mode",
    };
  } catch (err) {
    return {
      id: "razorpay",
      name: "Razorpay API",
      category: "service",
      status: "error",
      message: "API authentication failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkResend(): Promise<HealthCheckItem> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || isPlaceholder(apiKey)) {
    return {
      id: "resend",
      name: "Resend Email API",
      category: "service",
      status: "error",
      message: "Skipped — RESEND_API_KEY missing or placeholder",
    };
  }
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();
    if (error) {
      return {
        id: "resend",
        name: "Resend Email API",
        category: "service",
        status: "error",
        message: "API key rejected",
        detail: error.message,
      };
    }
    return {
      id: "resend",
      name: "Resend Email API",
      category: "service",
      status: "ok",
      message: "API key valid",
      detail: `${data?.data?.length ?? 0} domain(s) on account`,
    };
  } catch (err) {
    return {
      id: "resend",
      name: "Resend Email API",
      category: "service",
      status: "error",
      message: "API check failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkGmail(): Promise<HealthCheckItem> {
  const user = process.env.GMAIL_USER || "jobcareerpao@gmail.com";
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass || isPlaceholder(pass)) {
    return {
      id: "gmail",
      name: "Gmail OTP (jobcareerpao@gmail.com)",
      category: "service",
      status: "error",
      message: "Skipped — GMAIL_APP_PASSWORD missing or placeholder",
      detail: user,
    };
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.verify();
    return {
      id: "gmail",
      name: "Gmail OTP (jobcareerpao@gmail.com)",
      category: "service",
      status: "ok",
      message: "SMTP credentials valid",
      detail: user,
    };
  } catch (err) {
    return {
      id: "gmail",
      name: "Gmail OTP (jobcareerpao@gmail.com)",
      category: "service",
      status: "error",
      message: "Gmail SMTP check failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function runHealthChecks(live = true): Promise<HealthReport> {
  const checks: HealthCheckItem[] = [];

  // Core app
  addEnvCheck(checks, "mongodb_uri", "MONGODB_URI", "MONGODB_URI");
  addEnvCheck(checks, "auth_secret", "AUTH_SECRET", "AUTH_SECRET");
  addEnvCheck(checks, "auth_url", "AUTH_URL", "AUTH_URL");
  addEnvCheck(checks, "app_url", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_APP_URL", false);

  const authSecret = process.env.AUTH_SECRET;
  if (authSecret && authSecret.length < 32 && !isPlaceholder(authSecret)) {
    checks.push({
      id: "auth_secret_length",
      name: "AUTH_SECRET strength",
      category: "env",
      status: "warn",
      message: "Should be at least 32 characters",
    });
  } else if (authSecret && authSecret.length >= 32) {
    checks.push({
      id: "auth_secret_length",
      name: "AUTH_SECRET strength",
      category: "env",
      status: "ok",
      message: "Length OK (32+ chars)",
    });
  }

  // Cloudinary
  addEnvCheck(checks, "cloudinary_cloud", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_CLOUD_NAME");
  addEnvCheck(checks, "cloudinary_key", "CLOUDINARY_API_KEY", "CLOUDINARY_API_KEY");
  addEnvCheck(checks, "cloudinary_secret", "CLOUDINARY_API_SECRET", "CLOUDINARY_API_SECRET");

  // Razorpay
  addEnvCheck(checks, "razorpay_key", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_ID");
  addEnvCheck(checks, "razorpay_secret", "RAZORPAY_KEY_SECRET", "RAZORPAY_KEY_SECRET");
  addEnvCheck(checks, "razorpay_public", "NEXT_PUBLIC_RAZORPAY_KEY_ID", "NEXT_PUBLIC_RAZORPAY_KEY_ID");
  addEnvCheck(checks, "razorpay_webhook", "RAZORPAY_WEBHOOK_SECRET", "RAZORPAY_WEBHOOK_SECRET", false);

  // Email
  addEnvCheck(checks, "gmail_user", "GMAIL_USER", "GMAIL_USER", false);
  addEnvCheck(checks, "gmail_app_password", "GMAIL_APP_PASSWORD", "GMAIL_APP_PASSWORD");
  addEnvCheck(checks, "resend_key", "RESEND_API_KEY", "RESEND_API_KEY", false);
  addEnvCheck(checks, "email_from", "EMAIL_FROM", "EMAIL_FROM", false);

  // Admin
  addEnvCheck(checks, "admin_email", "ADMIN_EMAIL", "ADMIN_EMAIL", false);

  // Optional payment
  checks.push({
    id: "apply_gst",
    name: "APPLY_GST",
    category: "env",
    status: "ok",
    message: process.env.APPLY_GST === "true" ? "GST enabled (18%)" : "GST disabled",
    detail: `GST_RATE=${process.env.GST_RATE || "0.18"}`,
  });

  if (live) {
    checks.push(await checkMongoDB());
    checks.push(await checkCloudinary());
    checks.push(await checkRazorpay());
    checks.push(await checkGmail());
    checks.push(await checkResend());
  }

  const summary = {
    ok: checks.filter((c) => c.status === "ok").length,
    warn: checks.filter((c) => c.status === "warn").length,
    error: checks.filter((c) => c.status === "error").length,
    total: checks.length,
  };

  return {
    ok: summary.error === 0,
    checkedAt: new Date().toISOString(),
    summary,
    checks,
  };
}
