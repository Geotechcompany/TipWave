import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin can access everything
    if (token?.role === "ADMIN") {
      return NextResponse.next();
    }

    // Protect admin routes
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/admin", req.url));
    }

    // Protect DJ routes
    if (path.startsWith("/dashboard/dj") && 
        token?.role !== "DJ" && 
        token?.role !== "BOTH") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect User routes
    if (path.startsWith("/dashboard/user") && 
        token?.role !== "USER" && 
        token?.role !== "BOTH") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow other authenticated routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/dj/:path*',
    '/api/user/:path*'
  ]
}; 