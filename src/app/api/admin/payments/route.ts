import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireAdmin } from "@/lib/auth/helpers";
import { paginationSchema } from "@/lib/validations";
import {
  listPaymentsAdmin,
  exportPaymentsCsv,
  exportPaymentsExcel,
} from "@/lib/services/payment.service";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = paginationSchema.safeParse(params);
    const query = parsed.success ? parsed.data : { page: 1, limit: 20, order: "desc" as const };
    const exportFormat = params.export;

    const { payments, pagination } = await listPaymentsAdmin({
      page: query.page,
      limit: exportFormat ? 10000 : query.limit,
      search: query.search,
      status: params.status,
      sort: query.sort,
      order: query.order,
    });

    if (exportFormat === "csv") {
      const csv = await exportPaymentsCsv(payments as unknown as Array<Record<string, unknown>>);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="payments.csv"',
        },
      });
    }

    if (exportFormat === "excel") {
      const buffer = await exportPaymentsExcel(payments as unknown as Array<Record<string, unknown>>);
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="payments.xlsx"',
        },
      });
    }

    return successResponse(payments, undefined, 200, pagination);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch payments", 500);
  }
}
