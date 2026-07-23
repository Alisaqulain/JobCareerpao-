import { connectDB } from "@/lib/db/mongoose";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  hashPassword,
} from "@/lib/utils/crypto";
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from "@/lib/constants";
import { sendOtpEmail } from "@/lib/services/email.service";
import type { OtpPurpose } from "@/types";

export async function createAndSendOtp(params: {
  email: string;
  purpose: OtpPurpose;
  name?: string;
  phone?: string;
  password?: string;
}) {
  await connectDB();
  const email = params.email.toLowerCase();

  if (params.purpose === "signup") {
    const existing = await User.findOne({ email });
    if (existing?.isEmailVerified) {
      throw new Error("Email already registered. Please login.");
    }
  }

  if (params.purpose === "login" || params.purpose === "reset") {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No account found with this email");
    }
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  let passwordHash: string | undefined;
  if (params.password) {
    passwordHash = await hashPassword(params.password);
  }

  await Otp.deleteMany({ email, purpose: params.purpose });
  await Otp.create({
    email,
    otpHash,
    purpose: params.purpose,
    expiresAt,
    metadata: {
      name: params.name,
      phone: params.phone,
      passwordHash,
    },
  });

  await sendOtpEmail(email, otp, params.purpose);
  return { expiresInMinutes: OTP_EXPIRY_MINUTES };
}

export async function verifyOtpCode(params: {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}) {
  await connectDB();
  const email = params.email.toLowerCase();
  const record = await Otp.findOne({ email, purpose: params.purpose }).sort({
    createdAt: -1,
  });

  if (!record) {
    throw new Error("OTP expired or not found. Request a new one.");
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error("OTP has expired. Request a new one.");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error("Too many failed attempts. Request a new OTP.");
  }

  const valid = await verifyOtpHash(params.otp, record.otpHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    throw new Error("Invalid OTP");
  }

  await Otp.deleteOne({ _id: record._id });
  return record.metadata || {};
}
