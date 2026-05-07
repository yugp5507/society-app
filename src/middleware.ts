/**
 * src/middleware.ts
 *
 * Edge-compatible route protection using NextAuth v4 JWT.
 * Reads the signed JWT from the NextAuth session cookie and checks
 * the user's role before allowing access to protected segments.
 *
 * Route rules:
 *   /super-admin/*    → SUPER_ADMIN only
 *   /society-admin/*  → SOCIETY_ADMIN only
 *   /resident/*       → RESIDENT only
 *   Unauthenticated   → redirect to /login
 *   Wrong role        → redirect to their own dashboard
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Route → allowed role mapping
const ROLE_MAP: Record<string, string> = {
  "/super-admin": "SUPER_ADMIN",
  "/society-admin": "SOCIETY_ADMIN",
  "/resident": "RESIDENT",
};

// Role → default dashboard
const DASHBOARD_MAP: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SOCIETY_ADMIN: "/society-admin/dashboard",
  RESIDENT: "/resident/dashboard",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine which segment this route belongs to
  const segment = Object.keys(ROLE_MAP).find((seg) =>
    pathname.startsWith(seg)
  );

  // Not a protected route → let it through
  if (!segment) return NextResponse.next();

  // Retrieve the JWT. `getToken` is Edge-safe (no Node.js APIs).
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);

  // Not authenticated → send to login
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string | undefined;
  const requiredRole = ROLE_MAP[segment];

  // Authenticated but wrong role → send to their own dashboard
  if (userRole !== requiredRole) {
    const ownDashboard = userRole ? DASHBOARD_MAP[userRole] : "/login";
    return NextResponse.redirect(new URL(ownDashboard ?? "/login", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on protected segments (skip static files, API, auth)
export const config = {
  matcher: [
    "/super-admin/:path*",
    "/society-admin/:path*",
    "/resident/:path*",
  ],
};
