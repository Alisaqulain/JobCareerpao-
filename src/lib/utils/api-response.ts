import { NextResponse } from "next/server";
import type { ApiResponse, PaginationMeta } from "@/types";

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
  pagination?: PaginationMeta
) {
  const body: ApiResponse<T> = { success: true, data, message, pagination };
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status = 400, error?: string) {
  const body: ApiResponse = { success: false, message, error: error || message };
  return NextResponse.json(body, { status });
}
