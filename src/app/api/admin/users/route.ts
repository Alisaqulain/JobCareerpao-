import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin } from "@/lib/auth/helpers";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { paginationSchema } from "@/lib/validations";
import { getPagination } from "@/lib/utils/crypto";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };
    const skip = (query.page - 1) * query.limit;

    const filter: Record<string, unknown> = { role: "user" };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { phone: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortField = query.sort || "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return successResponse(users, undefined, 200, getPagination(query.page, query.limit, total));
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch users", 500);
  }
}
