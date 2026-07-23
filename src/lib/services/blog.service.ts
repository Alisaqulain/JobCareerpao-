import { connectDB } from "@/lib/db/mongoose";
import { Blog } from "@/models/Blog";
import { getPagination, parseSort } from "@/lib/utils/crypto";
import { deleteCloudinaryAsset } from "@/lib/services/cloudinary.service";
import type { BlogBlock } from "@/lib/blog";

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

function estimateReadingTime(blocks: BlogBlock[]): string {
  const text = blocks
    .map((b) => {
      if (b.type === "ul") return b.items.join(" ");
      return b.text;
    })
    .join(" ");
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min`;
}

export async function listBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  admin?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = params.limit || 12;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (!params.admin) filter.status = "published";
  if (params.search) filter.$text = { $search: params.search };
  if (params.category) filter.category = params.category;
  if (params.tag) filter.tags = params.tag;
  if (params.featured) filter.featured = true;

  const sort = parseSort(params.sort || "publishedDate", params.order || "desc");
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-content")
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return { blogs, pagination: getPagination(page, limit, total) };
}

export async function getBlogBySlug(slug: string, admin = false) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (!admin) filter.status = "published";

  const blog = await Blog.findOne(filter).lean();
  if (!blog) throw new Error("Blog not found");

  let related: typeof blog[] = [];
  if (blog.relatedPostIds?.length) {
    related = await Blog.find({
      _id: { $in: blog.relatedPostIds },
      status: "published",
    })
      .select("-content")
      .limit(3)
      .lean();
  } else {
    related = await Blog.find({
      _id: { $ne: blog._id },
      status: "published",
      category: blog.category,
    })
      .select("-content")
      .limit(3)
      .lean();
  }

  return { blog, related };
}

export async function getBlogCategories() {
  await connectDB();
  return Blog.distinct("category", { status: "published" });
}

export async function createBlog(data: Record<string, unknown>) {
  await connectDB();
  const title = String(data.title).trim();
  const slug = data.slug ? String(data.slug) : slugify(title);
  const existing = await Blog.findOne({ slug });
  if (existing) throw new Error("Slug already exists");

  const content = (data.content as BlogBlock[]) || [];
  const readingTime = data.readingTime || estimateReadingTime(content);

  const blog = await Blog.create({
    title,
    slug,
    coverImage: data.coverImage as string | undefined,
    coverImagePublicId: data.coverImagePublicId as string | undefined,
    category: String(data.category),
    author: String(data.author),
    publishedDate: data.status === "published" ? (data.publishedDate ? new Date(String(data.publishedDate)) : new Date()) : undefined,
    readingTime: String(readingTime),
    tags: (data.tags as string[]) || [],
    content,
    excerpt: String(data.excerpt),
    featured: Boolean(data.featured),
    status: (data.status as "draft" | "published") || "draft",
    seoTitle: data.seoTitle as string | undefined,
    seoDescription: data.seoDescription as string | undefined,
    ogImage: (data.ogImage as string | undefined) || (data.coverImage as string | undefined),
    relatedPostIds: (data.relatedPostIds as string[]) || [],
  });

  return blog;
}

export async function updateBlog(id: string, data: Record<string, unknown>) {
  await connectDB();
  const blog = await Blog.findById(id);
  if (!blog) throw new Error("Blog not found");

  if (data.title) blog.title = String(data.title).trim();
  if (data.slug) blog.slug = String(data.slug);
  if (data.coverImage !== undefined) blog.coverImage = data.coverImage as string | undefined;
  if (data.coverImagePublicId !== undefined) {
    blog.coverImagePublicId = data.coverImagePublicId as string | undefined;
  }
  if (data.category) blog.category = String(data.category);
  if (data.author) blog.author = String(data.author);
  if (data.readingTime) blog.readingTime = String(data.readingTime);
  if (data.tags) blog.tags = data.tags as string[];
  if (data.content) {
    blog.content = data.content as BlogBlock[];
    blog.readingTime = estimateReadingTime(blog.content);
  }
  if (data.excerpt) blog.excerpt = String(data.excerpt);
  if (data.featured !== undefined) blog.featured = Boolean(data.featured);
  if (data.seoTitle !== undefined) blog.seoTitle = data.seoTitle as string | undefined;
  if (data.seoDescription !== undefined) blog.seoDescription = data.seoDescription as string | undefined;
  if (data.ogImage !== undefined) blog.ogImage = data.ogImage as string | undefined;
  if (data.relatedPostIds) blog.relatedPostIds = data.relatedPostIds as typeof blog.relatedPostIds;

  if (data.status) {
    blog.status = data.status as "draft" | "published";
    if (data.status === "published" && !blog.publishedDate) {
      blog.publishedDate = new Date();
    }
  }
  if (data.publishedDate) blog.publishedDate = new Date(String(data.publishedDate));

  await blog.save();
  return blog;
}

export async function deleteBlog(id: string) {
  await connectDB();
  const blog = await Blog.findById(id);
  if (!blog) throw new Error("Blog not found");
  if (blog.coverImagePublicId) {
    await deleteCloudinaryAsset(blog.coverImagePublicId, "image");
  }
  await blog.deleteOne();
  return blog;
}

export async function getFeaturedBlogs(limit = 3) {
  await connectDB();
  return Blog.find({ status: "published", featured: true })
    .sort({ publishedDate: -1 })
    .limit(limit)
    .select("-content")
    .lean();
}
