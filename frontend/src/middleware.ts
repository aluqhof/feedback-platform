import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: redirects to /login if no session.
 *
 * The backend sets HttpOnly cookies (fp_access, fp_refresh).
 * We cannot read them from JS, but we can detect their absence
 * by checking if the middleware should protect a route.
 *
 * For now, this is a placeholder that only protects (app) routes.
 * In Phase 1, the backend will validate the JWT and we'll rely on
 * 401 responses + retry with refresh to handle token expiry.
 */

const protectedRoutes = ["/app"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    // Check for auth cookies — if absent, redirect to login
    const accessToken = request.cookies.get("fp_access");
    const refreshToken = request.cookies.get("fp_refresh");

    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match protected routes
    "/app/:path*",
  ],
};
