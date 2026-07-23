import mongoose, { Schema, Document, Model } from "mongoose";
import type { DynamicField, JobStatus } from "@/types";

export interface IJob extends Document {
  title: string;
  company: string;
  companyId?: mongoose.Types.ObjectId;
  description: string;
  salary: { min: number; max: number; currency: string };
  experience: string;
  qualification: string;
  skills: string[];
  location: string;
  jobType: string;
  mode: string;
  applicationFee: number;
  lastDate: Date;
  status: JobStatus;
  dynamicFields: DynamicField[];
  requiredDocuments: string[];
  applicationCount: number;
  isArchived: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "email",
        "phone",
        "select",
        "radio",
        "checkbox",
        "date",
        "number",
        "file",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [String],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
    },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", index: true },
    description: { type: String, required: true },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    experience: { type: String, required: true },
    qualification: { type: String, required: true },
    skills: { type: [String], default: [], index: true },
    location: { type: String, required: true, index: true },
    jobType: { type: String, required: true, index: true },
    mode: { type: String, default: "Hybrid" },
    applicationFee: { type: Number, required: true, min: 0 },
    lastDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
      index: true,
    },
    dynamicFields: { type: [DynamicFieldSchema], default: [] },
    requiredDocuments: { type: [String], default: [] },
    applicationCount: { type: Number, default: 0, index: true },
    isArchived: { type: Boolean, default: false },
    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", company: "text", skills: "text", location: "text" });
JobSchema.index({ status: 1, createdAt: -1 });

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
