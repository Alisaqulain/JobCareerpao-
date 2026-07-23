import { successResponse } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/helpers";

export async function GET() {
  const user = await getSessionUser();
  return successResponse({ user });
}
