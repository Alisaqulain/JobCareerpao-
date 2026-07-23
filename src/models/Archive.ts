import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IArchive extends Document {
  jobId: Types.ObjectId;
  jobTitle: string;
  archiveDate: Date;
  adminId: Types.ObjectId;
  adminEmail: string;
  applicationsDeleted: number;
  downloadedBy: string;
  resumesDeleted: number;
  createdAt: Date;
}

const ArchiveSchema = new Schema<IArchive>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobTitle: { type: String, required: true },
    archiveDate: { type: Date, default: Date.now, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    adminEmail: { type: String, required: true },
    applicationsDeleted: { type: Number, required: true },
    downloadedBy: { type: String, required: true },
    resumesDeleted: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Archive: Model<IArchive> =
  mongoose.models.Archive || mongoose.model<IArchive>("Archive", ArchiveSchema);
