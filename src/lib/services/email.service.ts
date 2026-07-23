import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const fromEmail = () =>
  process.env.EMAIL_FROM || "JobCareerPao <noreply@jobcareerpao.com>";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const client = getResend();
    const result = await client.emails.send({
      from: fromEmail(),
      to,
      subject,
      html,
    });
    logger.info("Email sent", { to, subject, id: result.data?.id });
    return result;
  } catch (error) {
    logger.error("Email send failed", { to, subject, error: String(error) });
    throw error;
  }
}

export async function sendOtpEmail(email: string, otp: string, purpose: string) {
  const action =
    purpose === "signup"
      ? "complete your registration"
      : purpose === "login"
        ? "sign in to your account"
        : "reset your password";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">JobCareerPao</h2>
      <p>Your OTP to ${action} is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0B4F8A">${otp}</p>
      <p>This code expires in 5 minutes. Do not share it with anyone.</p>
      <p style="color:#64748b;font-size:12px">If you did not request this, ignore this email.</p>
    </div>
  `;

  return sendEmail(email, `Your JobCareerPao OTP: ${otp}`, html);
}

export async function sendApplicationReceivedEmail(
  email: string,
  name: string,
  jobTitle: string,
  company: string
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Application Received</h2>
      <p>Hi ${name},</p>
      <p>We have received your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
      <p>Track your application status anytime from your profile dashboard.</p>
      <p style="color:#64748b;font-size:12px">JobCareerPao Team</p>
    </div>
  `;

  return sendEmail(email, `Application received: ${jobTitle}`, html);
}

export async function sendApplicationStatusEmail(
  email: string,
  name: string,
  jobTitle: string,
  status: string
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Application Status Update</h2>
      <p>Hi ${name},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
      <p>Login to your profile for more details.</p>
    </div>
  `;

  return sendEmail(email, `Application status: ${status}`, html);
}

export async function sendPaymentSuccessEmail(params: {
  email: string;
  name: string;
  amount: number;
  jobTitle: string;
  company: string;
  paymentId: string;
  orderId: string;
  applicationNumber: string;
}) {
  const supportEmail = process.env.ADMIN_EMAIL || "support@jobcareerpao.com";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Payment Successful ✅</h2>
      <p>Hi ${params.name},</p>
      <p>Your payment for <strong>${params.jobTitle}</strong> at <strong>${params.company}</strong> was successful.</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#64748b">Payment ID</td><td style="padding:8px 0;font-weight:600">${params.paymentId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Order ID</td><td style="padding:8px 0;font-weight:600">${params.orderId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Application No.</td><td style="padding:8px 0;font-weight:600">${params.applicationNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Amount Paid</td><td style="padding:8px 0;font-weight:600">₹${params.amount}</td></tr>
      </table>
      <p>Your application has been submitted. Track status from your dashboard.</p>
      <p style="color:#64748b;font-size:12px">Need help? Contact ${supportEmail}</p>
      <p style="color:#64748b;font-size:12px">JobCareerPao Team</p>
    </div>
  `;

  return sendEmail(params.email, `Payment successful — ${params.jobTitle}`, html);
}

export async function sendAdminAlertEmail(
  adminEmail: string,
  subject: string,
  message: string
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Admin Alert</h2>
      <p>${message}</p>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jobcareerpao.com";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${data.message}</p>
    </div>
  `;
  return sendEmail(adminEmail, `Contact: ${data.subject}`, html);
}

export async function sendNewsletterSignupEmail(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jobcareerpao.com";
  await sendEmail(adminEmail, "New newsletter subscriber", `<p>${email} subscribed to the newsletter.</p>`);
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Welcome to JobCareerPao</h2>
      <p>Thanks for subscribing! You'll receive career tips and job alerts weekly.</p>
    </div>
  `;
  return sendEmail(email, "You're subscribed to JobCareerPao", html);
}
