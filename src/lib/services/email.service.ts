import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logger } from "@/lib/utils/logger";
import { getSiteUrl } from "@/lib/site";

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
  company: string,
  extras?: {
    applicationNumber?: string;
    phone?: string;
    amount?: number;
    receiptNumber?: string;
  }
) {
  const siteUrl = getSiteUrl();
  const supportEmail = process.env.ADMIN_EMAIL || "support@jobcareerpao.com";
  const profileUrl = `${siteUrl}/profile`;
  const jobsUrl = `${siteUrl}/jobs`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px">
      <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#0B4F8A,#2DB6D6);padding:28px 24px;color:#fff">
          <p style="margin:0;font-size:13px;opacity:0.9;letter-spacing:0.04em">JOBCAREERPAO</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:700">Congratulations, ${name}!</h1>
          <p style="margin:8px 0 0;font-size:15px;opacity:0.95">Your application has been successfully submitted.</p>
        </div>

        <div style="padding:28px 24px">
          <p style="margin:0 0 16px;color:#0f172a;font-size:15px;line-height:1.6">
            Dear <strong>${name}</strong>,
          </p>
          <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7">
            Thank you for applying through JobCareerPao. We are pleased to confirm that your application for
            <strong>${jobTitle}</strong> at <strong>${company}</strong> has been received and securely recorded on our platform.
          </p>

          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;margin:20px 0">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0B4F8A;text-transform:uppercase;letter-spacing:0.04em">Your application details</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#64748b">Candidate</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${email}</td></tr>
              ${extras?.phone ? `<tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${extras.phone}</td></tr>` : ""}
              <tr><td style="padding:6px 0;color:#64748b">Position</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${jobTitle}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Company</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${company}</td></tr>
              ${extras?.applicationNumber ? `<tr><td style="padding:6px 0;color:#64748b">Application No.</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${extras.applicationNumber}</td></tr>` : ""}
              ${extras?.receiptNumber ? `<tr><td style="padding:6px 0;color:#64748b">Receipt No.</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${extras.receiptNumber}</td></tr>` : ""}
              ${typeof extras?.amount === "number" ? `<tr><td style="padding:6px 0;color:#64748b">Fee Paid</td><td style="padding:6px 0;font-weight:700;color:#F7941D;text-align:right">₹${extras.amount}</td></tr>` : ""}
            </table>
          </div>

          <h3 style="margin:24px 0 10px;color:#0B4F8A;font-size:16px">What happens next?</h3>
          <ol style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.8">
            <li>Your application is shared with the hiring team at <strong>${company}</strong>.</li>
            <li>Our team monitors application status on the platform.</li>
            <li>You will receive updates by email when your status changes.</li>
            <li>You can track progress anytime from your JobCareerPao profile.</li>
          </ol>

          <p style="margin:24px 0 12px;color:#334155;font-size:14px;line-height:1.7">
            JobCareerPao is a verified job application platform. Your payment is processed securely via Razorpay,
            and your application details are stored safely for this job only.
          </p>

          <p style="margin:24px 0">
            <a href="${profileUrl}" style="display:inline-block;background:#0B4F8A;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;margin-right:8px">
              View My Applications
            </a>
            <a href="${jobsUrl}" style="display:inline-block;background:#fff;color:#0B4F8A;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;border:1px solid #0B4F8A">
              Browse More Jobs
            </a>
          </p>

          <p style="margin:28px 0 0;color:#0f172a;font-size:14px">
            Warm regards,<br/>
            <strong>Team JobCareerPao</strong><br/>
            <span style="color:#64748b;font-size:12px">Need help? Write to ${supportEmail}</span>
          </p>
        </div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">
        © JobCareerPao · Secure job applications across India
      </p>
    </div>
  `;

  return sendEmail(
    email,
    `Congratulations! Application submitted — ${jobTitle} at ${company}`,
    html
  );
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
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:24px">
        <h2 style="color:#0B4F8A;margin:0 0 8px">Payment Receipt</h2>
        <p style="margin:0 0 16px;color:#334155">Hi ${params.name}, your payment for <strong>${params.jobTitle}</strong> at <strong>${params.company}</strong> was successful.</p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#64748b">Receipt No.</td><td style="padding:8px 0;font-weight:600;text-align:right">${params.receiptNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Payment ID</td><td style="padding:8px 0;font-weight:600;text-align:right">${params.paymentId}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Order ID</td><td style="padding:8px 0;font-weight:600;text-align:right">${params.orderId}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Application No.</td><td style="padding:8px 0;font-weight:600;text-align:right">${params.applicationNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Amount Paid</td><td style="padding:8px 0;font-weight:700;color:#F7941D;text-align:right">₹${params.amount}</td></tr>
        </table>
        <p style="margin:24px 0">
          <a href="${receiptUrl}" style="display:inline-block;background:#0B4F8A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            View &amp; Download Receipt
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;line-height:1.6">
          Keep this receipt for your records. Track payments anytime in your
          <a href="${profileUrl}" style="color:#0B4F8A">profile dashboard</a>.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:20px">Need help? Contact ${supportEmail}<br/>JobCareerPao Team</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, `Payment receipt — ${params.jobTitle} at ${params.company}`, html);
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
