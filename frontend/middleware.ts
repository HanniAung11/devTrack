import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (
    !access &&
    (pathname.startsWith("/admin") || pathname.startsWith("/developer"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (access && pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/developer/dashboard", request.url));
  }

  if (access && pathname.startsWith("/developer") && role !== "DEVELOPER") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (access && isAuthPage) {
    const dest =
      role === "ADMIN" ? "/admin/dashboard" : "/developer/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/developer/:path*",
    "/login",
    "/register",
  ],
};
