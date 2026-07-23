import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { PaymentStatus, RefundStatus } from "@/types";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  baseAmount: number;
  gstAmount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  gateway: string;
  receipt?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  applicationNumber?: string;
  refundStatus: RefundStatus;
  failureReason?: string;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, index: true, sparse: true },
    razorpaySignature: String,
    amount: { type: Number, required: true },
    baseAmount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded", "cancelled"],
      default: "created",
      index: true,
    },
    method: String,
    gateway: { type: String, default: "razorpay" },
    receipt: String,
    receiptNumber: { type: String, index: true, sparse: true },
    receiptUrl: String,
    applicationNumber: String,
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
      index: true,
    },
    failureReason: String,
    paidAt: { type: Date, index: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ userId: 1, jobId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
