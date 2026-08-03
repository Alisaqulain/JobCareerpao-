import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Payment } from "@/models/Payment";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  fetchRazorpayPayment,
  getRazorpayKeyId,
} from "@/lib/services/razorpay.service";
import {
  sendApplicationReceivedEmail,
  sendPaymentSuccessEmail,
} from "@/lib/services/email.service";
import {
  calculateFeeBreakdown,
  generateReceiptNumber,
  generateApplicationNumber,
} from "@/lib/payment-utils";
import { getPagination, parseSort } from "@/lib/utils/crypto";
import { PAYMENT_GATEWAY } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";
import { resolveApplicationResume } from "@/lib/services/resume.service";
import { incrementApplicationsAllTime } from "@/lib/services/analytics.service";
import { isProfileReadyForApply } from "@/lib/resume/profile";
import type { ResumeType } from "@/types";
import ExcelJS from "exceljs";

async function assertNoDuplicateApplication(userId: string, jobId: string) {
  const existing = await Application.findOne({ userId, jobId, paymentStatus: "paid" });
  if (existing) throw new Error("You have already applied for this job");
}

async function cancelPendingOrders(userId: string, jobId: string) {
  await Payment.updateMany(
    { userId, jobId, status: "created" },
    { status: "cancelled", failureReason: "Superseded by new order" }
  );
}

export async function createPaymentOrder(params: {
  userId: string;
  jobId: string;
  formAnswers: Record<string, unknown>;
  resumeType: ResumeType;
  resumeUrl?: string;
  resumePublicId?: string;
  coverLetter?: string;
}) {
  await connectDB();
  const job = await Job.findById(params.jobId);
  if (!job || job.status !== "active") throw new Error("Job not available");
  if (new Date(job.lastDate) < new Date()) throw new Error("Application deadline passed");

  await assertNoDuplicateApplication(params.userId, params.jobId);

  const user = await User.findById(params.userId);
  if (!user) throw new Error("User not found");
  if (!isProfileReadyForApply(user, params.resumeType)) {
    if (params.resumeType === "uploaded") {
      throw new Error("Please add your name and phone in your profile before applying");
    }
    throw new Error("Please complete your profile (skills, education, experience) for auto-generated resume");
  }
  if (params.resumeType === "uploaded" && (!params.resumeUrl || !params.resumePublicId)) {
    throw new Error("Please upload a resume for this application");
  }

  await cancelPendingOrders(params.userId, params.jobId);

  const fees = calculateFeeBreakdown(job.applicationFee);
  if (fees.total < 1) {
    throw new Error("This job has no application fee configured. Ask admin to set a fee of at least ₹10.");
  }

  const receipt = `job_${params.jobId}_${Date.now()}`.slice(0, 40);

  const order = await createRazorpayOrder({
    amount: fees.total,
    receipt,
    notes: {
      userId: params.userId,
      jobId: params.jobId,
    },
  });

  const payment = await Payment.create({
    userId: params.userId,
    jobId: params.jobId,
    razorpayOrderId: order.id,
    amount: fees.total,
    baseAmount: fees.applicationFee,
    gstAmount: fees.gst,
    currency: "INR",
    status: "created",
    gateway: PAYMENT_GATEWAY,
    receipt,
    metadata: {
      formAnswers: params.formAnswers,
      resumeType: params.resumeType,
      resumeUrl: params.resumeUrl,
      resumePublicId: params.resumePublicId,
      coverLetter: params.coverLetter,
      feeBreakdown: fees,
    },
  });

  return {
    orderId: order.id,
    paymentId: String(payment._id),
    amount: fees.total,
    baseAmount: fees.applicationFee,
    gstAmount: fees.gst,
    currency: "INR",
    key: getRazorpayKeyId(),
    jobTitle: job.title,
    company: job.company,
    applyGst: fees.applyGst,
  };
}

export async function getPaymentOrderDetails(
  orderId: string,
  userId: string,
  paymentId?: string | null
) {
  await connectDB();
  if (!userId) throw new Error("Unauthorized");

  let payment = await Payment.findOne({ razorpayOrderId: orderId })
    .populate("jobId", "title company applicationFee")
    .lean();

  if (!payment && paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
    payment = await Payment.findById(paymentId)
      .populate("jobId", "title company applicationFee")
      .lean();
  }

  if (!payment) throw new Error("Payment order not found");
  if (String(payment.userId) !== String(userId)) {
    throw new Error("Payment order not found");
  }

  const job = payment.jobId as
    | { _id?: { toString(): string }; title?: string; company?: string; applicationFee?: number }
    | string
    | null;
  const jobRecord =
    job && typeof job === "object" && "title" in job ? job : null;
  const resolvedJobId =
    jobRecord?._id?.toString?.() ||
    (typeof payment.jobId === "object" && payment.jobId !== null && "_id" in payment.jobId
      ? String((payment.jobId as { _id: unknown })._id)
      : String(payment.jobId));

  const fees = calculateFeeBreakdown(jobRecord?.applicationFee || payment.baseAmount);

  return {
    orderId: payment.razorpayOrderId,
    paymentId: String(payment._id),
    status: payment.status,
    amount: payment.amount,
    baseAmount: payment.baseAmount,
    gstAmount: payment.gstAmount,
    currency: payment.currency,
    key: getRazorpayKeyId(),
    jobTitle: jobRecord?.title,
    company: jobRecord?.company,
    jobId: resolvedJobId,
    feeBreakdown: fees,
  };
}

export async function verifyAndSubmitApplication(params: {
  userId: string;
  jobId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  formAnswers: Record<string, unknown>;
  resumeType: ResumeType;
  resumeUrl?: string;
  resumePublicId?: string;
  coverLetter?: string;
}) {
  const valid = verifyRazorpaySignature(
    params.razorpayOrderId,
    params.razorpayPaymentId,
    params.razorpaySignature
  );
  if (!valid) throw new Error("Payment verification failed — invalid signature");

  return completePayment({
    userId: params.userId,
    jobId: params.jobId,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    formAnswers: params.formAnswers,
    resumeType: params.resumeType,
    resumeUrl: params.resumeUrl,
    resumePublicId: params.resumePublicId,
    coverLetter: params.coverLetter,
  });
}

async function completePayment(params: {
  userId: string;
  jobId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  formAnswers: Record<string, unknown>;
  resumeType: ResumeType;
  resumeUrl?: string;
  resumePublicId?: string;
  coverLetter?: string;
  method?: string;
  skipSignatureCheck?: boolean;
}) {
  await connectDB();

  const payment = await Payment.findOne({
    razorpayOrderId: params.razorpayOrderId,
  });
  if (!payment || String(payment.userId) !== String(params.userId)) {
    throw new Error("Payment record not found");
  }
  if (payment.status === "paid") {
    const app = await Application.findOne({ paymentId: payment._id });
    return { payment, application: app, alreadyProcessed: true };
  }
  if (payment.status !== "created") {
    throw new Error(`Payment cannot be processed — status: ${payment.status}`);
  }

  await assertNoDuplicateApplication(params.userId, params.jobId);

  let paymentMethod = params.method || "unknown";
  if (!params.method) {
    try {
      const rpPayment = await fetchRazorpayPayment(params.razorpayPaymentId);
      paymentMethod = (rpPayment as { method?: string }).method || "unknown";
    } catch {
      logger.warn("Could not fetch Razorpay payment details", { id: params.razorpayPaymentId });
    }
  }

  const job = await Job.findById(params.jobId);
  const user = await User.findById(params.userId);
  if (!job || !user) throw new Error("Invalid job or user");

  const metadata = payment.metadata as {
    formAnswers?: Record<string, unknown>;
    resumeType?: ResumeType;
    resumeUrl?: string;
    resumePublicId?: string;
    coverLetter?: string;
  } | undefined;

  const formAnswers = params.formAnswers || metadata?.formAnswers || {};
  const resumeType = params.resumeType || metadata?.resumeType || "generated";
  const coverLetter = params.coverLetter || metadata?.coverLetter;

  const receiptNumber = generateReceiptNumber();
  const applicationNumber = generateApplicationNumber();
  const paidAt = new Date();

  const resolvedResume = await resolveApplicationResume({
    userId: params.userId,
    jobId: params.jobId,
    applicationNumber,
    resume: {
      resumeType,
      resumeUrl: params.resumeUrl || metadata?.resumeUrl,
      resumePublicId: params.resumePublicId || metadata?.resumePublicId,
      coverLetter,
    },
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payment.razorpayPaymentId = params.razorpayPaymentId;
    if (params.razorpaySignature) payment.razorpaySignature = params.razorpaySignature;
    payment.status = "paid";
    payment.method = paymentMethod;
    payment.paidAt = paidAt;
    payment.receiptNumber = receiptNumber;
    payment.applicationNumber = applicationNumber;
    payment.receiptUrl = `/payment/receipt/${payment._id}`;
    await payment.save({ session });

    const application = await Application.create(
      [
        {
          userId: params.userId,
          jobId: params.jobId,
          applicationNumber,
          resumeUrl: resolvedResume.url,
          resumePublicId: resolvedResume.publicId,
          resumeType: resolvedResume.resumeType,
          profileSnapshot: resolvedResume.snapshot as unknown as Record<string, unknown>,
          coverLetter,
          formAnswers,
          paymentStatus: "paid",
          paymentId: payment._id,
          razorpayPaymentId: params.razorpayPaymentId,
          appliedDate: paidAt,
          status: "applied",
          jobTitle: job.title,
          companyName: job.company,
        },
      ],
      { session }
    );

    payment.applicationId = application[0]._id;
    await payment.save({ session });

    await Job.findByIdAndUpdate(params.jobId, { $inc: { applicationCount: 1 } }, { session });

    await session.commitTransaction();
    await incrementApplicationsAllTime(1);

    await Promise.all([
      sendApplicationReceivedEmail(user.email, user.name, job.title, job.company),
      sendPaymentSuccessEmail({
        email: user.email,
        name: user.name,
        amount: payment.amount,
        jobTitle: job.title,
        company: job.company,
        paymentId: params.razorpayPaymentId,
        orderId: params.razorpayOrderId,
        applicationNumber,
        receiptNumber,
        receiptId: String(payment._id),
      }),
    ]);

    return { payment, application: application[0], alreadyProcessed: false };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function markPaymentFailed(
  orderId: string,
  reason: string,
  userId?: string
) {
  await connectDB();
  const filter: Record<string, unknown> = { razorpayOrderId: orderId, status: "created" };
  if (userId) filter.userId = userId;

  const payment = await Payment.findOneAndUpdate(
    filter,
    { status: "failed", failureReason: reason },
    { new: true }
  );
  return payment;
}

export async function markPaymentCancelled(orderId: string, userId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { razorpayOrderId: orderId, status: "created" };
  if (userId) filter.userId = userId;

  return Payment.findOneAndUpdate(
    filter,
    { status: "cancelled", failureReason: "Payment cancelled by user" },
    { new: true }
  );
}

export async function handleWebhookEvent(rawBody: string, signature: string) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new Error("Invalid webhook signature");
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      payment?: { entity: Record<string, unknown> };
      order?: { entity: Record<string, unknown> };
    };
  };

  await connectDB();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const paymentEntity = event.payload.payment?.entity;
    if (!paymentEntity) return { handled: false };

    const orderId = String(paymentEntity.order_id);
    const paymentId = String(paymentEntity.id);
    const existing = await Payment.findOne({ razorpayOrderId: orderId });

    if (!existing || existing.status === "paid") {
      return { handled: true, skipped: true };
    }

    const metadata = existing.metadata as {
      formAnswers?: Record<string, unknown>;
      resumeType?: ResumeType;
      resumeUrl?: string;
      resumePublicId?: string;
      coverLetter?: string;
    };

    await completePayment({
      userId: String(existing.userId),
      jobId: String(existing.jobId),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      formAnswers: metadata?.formAnswers || {},
      resumeType: metadata?.resumeType || "generated",
      resumeUrl: metadata?.resumeUrl,
      resumePublicId: metadata?.resumePublicId,
      coverLetter: metadata?.coverLetter,
      method: String(paymentEntity.method || "unknown"),
    });

    return { handled: true, event: event.event };
  }

  if (event.event === "payment.failed") {
    const paymentEntity = event.payload.payment?.entity;
    if (!paymentEntity) return { handled: false };

    const orderId = String(paymentEntity.order_id);
    const reason = String(
      (paymentEntity.error_description as string) ||
        (paymentEntity.error_reason as string) ||
        "Payment failed"
    );
    await markPaymentFailed(orderId, reason);
    return { handled: true, event: event.event };
  }

  return { handled: false, event: event.event };
}

export async function getPaymentReceipt(paymentId: string, userId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { _id: paymentId, status: "paid" };
  if (userId) filter.userId = userId;

  const payment = await Payment.findOne(filter)
    .populate("userId", "name email phone")
    .populate("jobId", "title company")
    .lean();

  if (!payment) throw new Error("Receipt not found");

  const user = payment.userId as { name?: string; email?: string };
  const job = payment.jobId as { title?: string; company?: string };

  return {
    receiptNumber: payment.receiptNumber,
    paymentId: payment.razorpayPaymentId,
    orderId: payment.razorpayOrderId,
    applicationNumber: payment.applicationNumber,
    candidateName: user.name,
    candidateEmail: user.email,
    company: job.company,
    jobTitle: job.title,
    baseAmount: payment.baseAmount,
    gstAmount: payment.gstAmount,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paidAt,
    method: payment.method,
    internalId: String(payment._id),
  };
}

export async function getUserPayments(userId: string) {
  await connectDB();
  return Payment.find({ userId })
    .populate("jobId", "title company")
    .populate("applicationId", "applicationNumber status")
    .sort({ createdAt: -1 })
    .lean();
}

export async function listPaymentsAdmin(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;

  if (params.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ],
    }).select("_id");
    filter.$or = [
      { userId: { $in: users.map((u) => u._id) } },
      { razorpayPaymentId: { $regex: params.search, $options: "i" } },
      { razorpayOrderId: { $regex: params.search, $options: "i" } },
      { receiptNumber: { $regex: params.search, $options: "i" } },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("userId", "name email phone")
      .populate("jobId", "title company")
      .populate("applicationId", "applicationNumber appliedDate status")
      .sort(parseSort(params.sort || "createdAt", params.order || "desc"))
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return { payments, pagination: getPagination(page, limit, total) };
}

export async function exportPaymentsCsv(payments: Array<Record<string, unknown>>) {
  const headers = [
    "Payment ID",
    "Order ID",
    "User",
    "Email",
    "Job",
    "Company",
    "Amount",
    "GST",
    "Status",
    "Gateway",
    "Refund Status",
    "Paid At",
  ];
  const rows = payments.map((p) => {
    const user = p.userId as { name?: string; email?: string };
    const job = p.jobId as { title?: string; company?: string };
    return [
      p.razorpayPaymentId || "",
      p.razorpayOrderId || "",
      user?.name || "",
      user?.email || "",
      job?.title || "",
      job?.company || "",
      p.amount,
      p.gstAmount || 0,
      p.status,
      p.gateway || "razorpay",
      p.refundStatus || "none",
      p.paidAt ? new Date(String(p.paidAt)).toISOString() : "",
    ];
  });

  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

export async function exportPaymentsExcel(payments: Array<Record<string, unknown>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Payments");
  sheet.columns = [
    { header: "Payment ID", key: "paymentId", width: 24 },
    { header: "Order ID", key: "orderId", width: 24 },
    { header: "User", key: "user", width: 20 },
    { header: "Email", key: "email", width: 28 },
    { header: "Job", key: "job", width: 24 },
    { header: "Company", key: "company", width: 20 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "GST", key: "gst", width: 10 },
    { header: "Status", key: "status", width: 12 },
    { header: "Gateway", key: "gateway", width: 12 },
    { header: "Refund Status", key: "refund", width: 14 },
    { header: "Paid At", key: "paidAt", width: 22 },
  ];

  for (const p of payments) {
    const user = p.userId as { name?: string; email?: string };
    const job = p.jobId as { title?: string; company?: string };
    sheet.addRow({
      paymentId: p.razorpayPaymentId || "",
      orderId: p.razorpayOrderId || "",
      user: user?.name || "",
      email: user?.email || "",
      job: job?.title || "",
      company: job?.company || "",
      amount: p.amount,
      gst: p.gstAmount || 0,
      status: p.status,
      gateway: p.gateway || "razorpay",
      refund: p.refundStatus || "none",
      paidAt: p.paidAt ? new Date(String(p.paidAt)).toISOString() : "",
    });
  }

  return workbook.xlsx.writeBuffer();
}
