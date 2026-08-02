import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ApplicationStatus, PaymentStatus, ResumeType } from "@/types";

export interface IApplication extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  applicationNumber: string;
  resumeUrl: string;
  resumePublicId?: string;
  resumeType: ResumeType;
  profileSnapshot?: Record<string, unknown>;
  coverLetter?: string;
  formAnswers: Record<string, unknown>;
  paymentStatus: PaymentStatus;
  paymentId?: Types.ObjectId;
  razorpayPaymentId?: string;
  appliedDate: Date;
  status: ApplicationStatus;
  adminNotes?: string;
  jobTitle?: string;
  companyName?: string;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicationNumber: { type: String, required: true, unique: true, index: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String, index: true, sparse: true },
    resumeType: { type: String, enum: ["generated", "uploaded"], default: "uploaded", index: true },
    profileSnapshot: { type: Schema.Types.Mixed },
    coverLetter: String,
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
      enum: [
        "applied",
        "under_review",
        "shortlisted",
        "interview",
        "selected",
        "rejected",
        "archived",
        "pending",
      ],
      default: "applied",
      index: true,
    },
    adminNotes: String,
    jobTitle: { type: String, index: true },
    companyName: { type: String, index: true },
    archivedAt: { type: Date, index: true, sparse: true },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ jobId: 1, status: 1, appliedDate: -1 });
ApplicationSchema.index({ status: 1, appliedDate: -1 });
ApplicationSchema.index({ companyName: 1, status: 1, appliedDate: -1 });
ApplicationSchema.index({ jobTitle: "text", companyName: "text" });

ApplicationSchema.pre("save", function normalizeLegacyStatus() {
  if (this.status === "pending") {
    this.status = "applied";
  }
});

export const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
