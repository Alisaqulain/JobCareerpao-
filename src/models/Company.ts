import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  CompanyCategory,
  CompanySize,
  HiringStatus,
  VerificationStatus,
} from "@/lib/constants/companies";

export interface ICompany extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  logoPublicId?: string;
  bannerUrl?: string;
  bannerPublicId?: string;
  category: CompanyCategory;
  industry: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  hrContactPerson?: string;
  headOffice: string;
  headquarters?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  foundedYear?: string;
  companySize?: CompanySize;
  hiringStatus: HiringStatus;
  verificationStatus: VerificationStatus;
  metaTitle?: string;
  metaDescription?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    logoUrl: String,
    logoPublicId: String,
    bannerUrl: String,
    bannerPublicId: String,
    category: { type: String, default: "Others", index: true },
    industry: { type: String, required: true, index: true },
    description: { type: String, required: true },
    website: String,
    email: { type: String, index: true, sparse: true },
    phone: String,
    hrContactPerson: String,
    headOffice: { type: String, default: "", index: true },
    headquarters: String,
    city: { type: String, default: "", index: true },
    state: { type: String, default: "", index: true },
    country: { type: String, default: "India", index: true },
    pincode: String,
    foundedYear: String,
    companySize: String,
    hiringStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    metaTitle: String,
    metaDescription: String,
    color: { type: String, default: "#0B4F8A" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CompanySchema.index({ name: "text", industry: "text", description: "text", city: "text", state: "text" });
CompanySchema.index({ category: 1, city: 1, state: 1, isActive: 1 });
CompanySchema.index({ category: 1, hiringStatus: 1, verificationStatus: 1 });

export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
