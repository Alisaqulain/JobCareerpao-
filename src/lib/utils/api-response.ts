import { NextResponse } from "next/server";
import type { ApiResponse, PaginationMeta } from "@/types";

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
  pagination?: PaginationMeta,
  cacheSeconds?: number
) {
  const body: ApiResponse<T> = { success: true, data, message, pagination };
  const response = NextResponse.json(body, { status });
  if (cacheSeconds) {
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 5}`
    );
  }
  return response;
}

export function errorResponse(message: string, status = 400, error?: string) {
  const body: ApiResponse = { success: false, message, error: error || message };
  return NextResponse.json(body, { status });
}
