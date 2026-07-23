import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { paginationSchema } from "@/lib/validations";
import { listCompanies } from "@/lib/services/company.service";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "asc" as const };

    const { companies, pagination } = await listCompanies({
      page: query.page,
      limit: query.limit,
      search: query.search,
      industry: params.industry,
      sort: query.sort,
      order: query.order,
    });

    return successResponse(companies, undefined, 200, pagination);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch companies", 500);
  }
}
