import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { verifyPassword, hashPassword } from "@/lib/utils/crypto";
import { verifyOtpCode } from "@/lib/services/otp.service";
import type { OtpPurpose } from "@/types";

export async function registerUserWithOtp(params: {
  email: string;
  otp: string;
  name?: string;
  phone?: string;
  password?: string;
}) {
  await connectDB();
  const metadata = await verifyOtpCode({
    email: params.email,
    otp: params.otp,
    purpose: "signup",
  });

  const email = params.email.toLowerCase();
  const name = params.name || metadata.name;
  const phone = params.phone || metadata.phone;
  const passwordPlain = params.password;
  const passwordHash = metadata.passwordHash;

  if (!name || !phone) {
    throw new Error("Name and phone are required");
  }

  let password = passwordHash;
  if (passwordPlain) {
    password = await hashPassword(passwordPlain);
  }
  if (!password) {
    throw new Error("Password is required");
  }

  let user = await User.findOne({ email }).select("+password");

  if (user) {
    user.name = name;
    user.phone = phone;
    user.password = password;
    user.isEmailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      phone,
      password,
      isEmailVerified: true,
      role: "user",
    });
  }

  return user;
}

export async function loginUserWithPassword(email: string, password: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new Error("Invalid email or password");
  if (!user.isEmailVerified) throw new Error("Please verify your email first");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function loginUserWithOtp(email: string, otp: string) {
  await connectDB();
  await verifyOtpCode({ email, otp, purpose: "login" as OtpPurpose });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function loginAdmin(email: string, password: string) {
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
  if (!admin) throw new Error("Invalid admin credentials");

  const valid = await verifyPassword(password, admin.password);
  if (!valid) throw new Error("Invalid admin credentials");

  admin.lastLoginAt = new Date();
  await admin.save();
  return admin;
}

export function serializeUser(user: {
  _id: { toString(): string };
  email: string;
  name: string;
  role: string;
  profileComplete?: boolean;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as "user" | "admin",
    profileComplete: user.profileComplete ?? false,
  };
}

export function serializeAdmin(admin: {
  _id: { toString(): string };
  email: string;
  name: string;
}) {
  return {
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    role: "admin" as const,
    profileComplete: true,
  };
}
