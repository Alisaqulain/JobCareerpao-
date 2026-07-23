import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  logoPublicId?: string;
  website?: string;
  industry: string;
  description: string;
  headquarters: string;
  founded?: string;
  employeeCount?: string;
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
    website: String,
    industry: { type: String, required: true, index: true },
    description: { type: String, required: true },
    headquarters: { type: String, required: true, index: true },
    founded: String,
    employeeCount: String,
    color: { type: String, default: "#0B4F8A" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CompanySchema.index({ name: "text", industry: "text", description: "text" });

export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
