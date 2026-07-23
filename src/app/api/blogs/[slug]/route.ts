import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getBlogBySlug } from "@/lib/services/blog.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await getBlogBySlug(slug);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Blog not found", 404);
  }
}
