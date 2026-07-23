import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin, parseJsonBody } from "@/lib/auth/helpers";
import { blogSchema, paginationSchema } from "@/lib/validations";
import { listBlogs, createBlog, updateBlog, deleteBlog } from "@/lib/services/blog.service";
import { validateCsrfOrigin } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };

    const { blogs, pagination } = await listBlogs({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: params.category,
      admin: true,
      sort: query.sort,
      order: query.order,
    });

    return successResponse(blogs, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch blogs", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody(request);
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const blog = await createBlog(parsed.data as unknown as Record<string, unknown>);
    return successResponse(blog, "Blog created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create blog", 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const blogId = body.blogId as string | undefined;
    if (!blogId) return errorResponse("blogId is required", 400);

    const parsed = blogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation failed", 400);
    }

    const blog = await updateBlog(blogId, parsed.data as Record<string, unknown>);
    return successResponse(blog, "Blog updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update blog", 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!validateCsrfOrigin(request)) return errorResponse("Invalid request origin", 403);
    const { error } = await requireAdmin();
    if (error) return error;

    const blogId = request.nextUrl.searchParams.get("blogId");
    if (!blogId) return errorResponse("blogId is required", 400);

    await deleteBlog(blogId);
    return successResponse(null, "Blog deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete blog", 400);
  }
}
