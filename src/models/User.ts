import mongoose, { Schema, Document, Model } from "mongoose";
import type { EducationEntry, ExperienceEntry, UserRole, UserAddress } from "@/types";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  profileComplete: boolean;
  bio?: string;
  location?: string;
  address?: UserAddress;
  languages: string[];
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  /** @deprecated Profile no longer stores resumes — kept for legacy records only */
  resumeUrl?: string;
  /** @deprecated */
  resumePublicId?: string;
  profilePicture?: string;
  profilePicturePublicId?: string;
  certificates: Array<{ name: string; issuer: string; year: number; url?: string }>;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true },
    grade: String,
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    line1: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    isEmailVerified: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    bio: String,
    location: String,
    address: AddressSchema,
    languages: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    resumeUrl: String,
    resumePublicId: String,
    profilePicture: String,
    profilePicturePublicId: String,
    certificates: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          year: { type: Number, required: true },
          url: String,
        },
      ],
      default: [],
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });
UserSchema.index({ name: "text", email: "text", skills: "text" });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
