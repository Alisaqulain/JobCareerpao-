import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { paginationSchema } from "@/lib/validations";
import { listBlogs, getBlogCategories } from "@/lib/services/blog.service";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());

    if (params.type === "categories") {
      const categories = await getBlogCategories();
      return successResponse(categories);
    }

    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 12, order: "desc" as const };

    const { blogs, pagination } = await listBlogs({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: params.category,
      tag: params.tag,
      featured: params.featured === "true",
    });

    return successResponse(blogs, undefined, 200, pagination, 120);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch blogs", 500);
  }
}
