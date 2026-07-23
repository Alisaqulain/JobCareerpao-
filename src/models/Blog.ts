import mongoose, { Schema, Document, Model } from "mongoose";
import type { BlogBlock } from "@/lib/blog";

export type BlogStatus = "draft" | "published";

export interface IBlog extends Document {
  title: string;
  slug: string;
  coverImage?: string;
  coverImagePublicId?: string;
  category: string;
  author: string;
  publishedDate?: Date;
  readingTime: string;
  tags: string[];
  content: BlogBlock[];
  excerpt: string;
  featured: boolean;
  status: BlogStatus;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  relatedPostIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: String,
    coverImagePublicId: String,
    category: { type: String, required: true, index: true },
    author: { type: String, required: true },
    publishedDate: { type: Date, index: true },
    readingTime: { type: String, default: "5 min" },
    tags: { type: [String], default: [], index: true },
    content: { type: Schema.Types.Mixed, default: [] },
    excerpt: { type: String, required: true },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    seoTitle: String,
    seoDescription: String,
    ogImage: String,
    relatedPostIds: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

BlogSchema.index({ title: "text", excerpt: "text", tags: "text", category: "text" });

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
