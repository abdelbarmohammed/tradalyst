import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user_id: number;
  role: "trader" | "mentor" | "admin";
  exp: number;
}

// Routes accessible without authentication
const PUBLIC_PATHS = new Set(["/login", "/registro", "/recuperar-contrasena"]);

// Role → allowed path prefixes
const ROLE_PATHS: Record<string, string[]> = {
  trader: ["/dashboard", "/journal", "/ai", "/analytics", "/settings", "/onboarding", "/prices"],
  mentor: ["/mentor", "/settings"],
  admin:  ["/admin", "/settings"],
};

// Role → home redirect after login
const ROLE_HOME: Record<string, string> = {
  trader: "/dashboard",
  mentor: "/mentor",
  admin:  "/admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internal routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  // No token — redirect to login unless already on a public path
  if (!token) {
    if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Decode token (no signature verification — that's the backend's job)
  let payload: JwtPayload;
  try {
    payload = jwtDecode<JwtPayload>(token);
  } catch {
    // Malformed token — clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
  }

  // Expired token — let the API call trigger a refresh; don't block here
  // (The api.ts client handles 401 → refresh → retry)

  const { role } = payload;

  // Authenticated user on login/registro → redirect to their home
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", request.url));
  }

  // Root → redirect to role home
  if (pathname === "/") {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", request.url));
  }

  // Enforce role-based path access
  const allowed = ROLE_PATHS[role] ?? [];
  const canAccess = allowed.some((prefix) => pathname.startsWith(prefix));
  if (!canAccess) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
