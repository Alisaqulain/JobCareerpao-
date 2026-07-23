import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { requireUser } from "@/lib/auth/helpers";
import { getUserPayments } from "@/lib/services/payment.service";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const payments = await getUserPayments(user!.id);
  return successResponse(payments);
}
