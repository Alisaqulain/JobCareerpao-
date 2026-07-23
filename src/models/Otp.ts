import mongoose, { Schema, Document, Model } from "mongoose";
import type { OtpPurpose } from "@/types";

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  attempts: number;
  expiresAt: Date;
  metadata?: {
    name?: string;
    phone?: string;
    passwordHash?: string;
  };
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["signup", "login", "reset"],
      required: true,
      index: true,
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    metadata: {
      name: String,
      phone: String,
      passwordHash: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

OtpSchema.index({ email: 1, purpose: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
