import { auth } from "@/lib/auth/config";
import { errorResponse } from "@/lib/utils/api-response";
import type { UserRole } from "@/types";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth(roles?: UserRole[]) {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: errorResponse("Unauthorized", 401) };
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null, error: errorResponse("Forbidden", 403) };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  return requireAuth(["admin"]);
}

export async function requireUser() {
  return requireAuth(["user", "admin"]);
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}
