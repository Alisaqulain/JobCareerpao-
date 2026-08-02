import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlatformAnalytics extends Document {
  key: string;
  totalApplicationsAllTime: number;
  archivedApplicationsDeleted: number;
  deletedByStatus: Record<string, number>;
  deletedResumes: number;
  lastCleanupAt?: Date;
  updatedAt: Date;
}

const PlatformAnalyticsSchema = new Schema<IPlatformAnalytics>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    totalApplicationsAllTime: { type: Number, default: 0 },
    archivedApplicationsDeleted: { type: Number, default: 0 },
    deletedByStatus: { type: Schema.Types.Mixed, default: {} },
    deletedResumes: { type: Number, default: 0 },
    lastCleanupAt: Date,
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const PlatformAnalytics: Model<IPlatformAnalytics> =
  mongoose.models.PlatformAnalytics ||
  mongoose.model<IPlatformAnalytics>("PlatformAnalytics", PlatformAnalyticsSchema);
