import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    (pathname.startsWith("/jobs/") && (pathname.endsWith("/apply") || pathname.endsWith("/review"))) ||
    pathname === "/payment";

  if (!protectedPaths) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/auth/login";
    const url = new URL(loginUrl, request.url);
    url.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/jobs/:id/apply",
    "/jobs/:id/review",
    "/payment",
  ],
};
