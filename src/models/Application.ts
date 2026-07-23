import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ApplicationStatus, PaymentStatus } from "@/types";

export interface IApplication extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  applicationNumber: string;
  resumeUrl: string;
  resumePublicId?: string;
  formAnswers: Record<string, unknown>;
  paymentStatus: PaymentStatus;
  paymentId?: Types.ObjectId;
  razorpayPaymentId?: string;
  appliedDate: Date;
  status: ApplicationStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicationNumber: { type: String, required: true, unique: true, index: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: String,
    formAnswers: { type: Schema.Types.Mixed, default: {} },
    paymentStatus: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    razorpayPaymentId: { type: String, index: true },
    appliedDate: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: ["pending", "selected", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: String,
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ jobId: 1, status: 1, appliedDate: -1 });
ApplicationSchema.index({ status: 1, appliedDate: -1 });

export const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
