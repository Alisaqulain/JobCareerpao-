import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logger } from "@/lib/utils/logger";

const OTP_GMAIL = "jobcareerpao@gmail.com";

let resend: Resend | null = null;
let gmailTransporter: nodemailer.Transporter | null = null;

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
  process.env.EMAIL_FROM || `JobCareerPao <${OTP_GMAIL}>`;

function getOtpFromAddress() {
  const user = process.env.GMAIL_USER || OTP_GMAIL;
  return process.env.EMAIL_FROM || `JobCareerPao <${user}>`;
}

function getGmailTransporter() {
  const user = process.env.GMAIL_USER || OTP_GMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error(
      "GMAIL_APP_PASSWORD is not configured. Create a Google App Password for jobcareerpao@gmail.com"
    );
  }
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return gmailTransporter;
}

async function sendOtpViaGmail(to: string, subject: string, html: string) {
  try {
    const transporter = getGmailTransporter();
    const result = await transporter.sendMail({
      from: getOtpFromAddress(),
      to,
      subject,
      html,
    });
    logger.info("OTP email sent via Gmail", { to, subject, messageId: result.messageId });
    return result;
  } catch (error) {
    logger.error("Gmail OTP send failed", { to, subject, error: String(error) });
    throw error;
  }
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://jobcareerpao.com"
  ).replace(/\/$/, "");
}

async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    try {
      const client = getResend();
      const result = await client.emails.send({
        from: fromEmail(),
        to,
        subject,
        html,
      });
      logger.info("Email sent via Resend", { to, subject, id: result.data?.id });
      return result;
    } catch (error) {
      logger.warn("Resend failed, trying Gmail fallback", { to, subject, error: String(error) });
    }
  }

  try {
    const result = await sendOtpViaGmail(to, subject, html);
    logger.info("Email sent via Gmail", { to, subject });
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

  return sendOtpViaGmail(email, `Your JobCareerPao OTP: ${otp}`, html);
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
  receiptNumber: string;
  receiptId: string;
}) {
  const supportEmail = process.env.ADMIN_EMAIL || "support@jobcareerpao.com";
  const receiptUrl = `${getSiteUrl()}/payment/receipt/${params.receiptId}`;
  const profileUrl = `${getSiteUrl()}/profile/payments`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B4F8A">Payment Successful ✅</h2>
      <p>Hi ${params.name},</p>
      <p>Your payment for <strong>${params.jobTitle}</strong> at <strong>${params.company}</strong> was successful.</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#64748b">Receipt No.</td><td style="padding:8px 0;font-weight:600">${params.receiptNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Payment ID</td><td style="padding:8px 0;font-weight:600">${params.paymentId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Order ID</td><td style="padding:8px 0;font-weight:600">${params.orderId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Application No.</td><td style="padding:8px 0;font-weight:600">${params.applicationNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Amount Paid</td><td style="padding:8px 0;font-weight:600">₹${params.amount}</td></tr>
      </table>
      <p style="margin:24px 0">
        <a href="${receiptUrl}" style="display:inline-block;background:#0B4F8A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          View &amp; Download Receipt
        </a>
      </p>
      <p>Your application has been submitted. You can also view all payments in your <a href="${profileUrl}">profile dashboard</a>.</p>
      <p style="color:#64748b;font-size:12px">Open the receipt page and use Print or Download to save a copy.</p>
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
