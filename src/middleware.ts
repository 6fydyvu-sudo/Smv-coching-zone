import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Edge-level route protection. This is a first line of defense only —
 * every server action / API route handler also re-checks the role via
 * requireRole() in src/lib/rbac.ts, because middleware alone must never
 * be trusted as the sole authorization boundary.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    if (pathname.startsWith("/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/login"
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"]
};
