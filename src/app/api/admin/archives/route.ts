import { successResponse } from "@/lib/utils/api-response";
import { requireAdmin } from "@/lib/auth/helpers";
import { connectDB } from "@/lib/db/mongoose";
import { Archive } from "@/models/Archive";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const archives = await Archive.find().sort({ archiveDate: -1 }).limit(50).lean();
  return successResponse(archives);
}
