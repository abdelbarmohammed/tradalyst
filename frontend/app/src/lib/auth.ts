/**
 * Auth helpers — reading user context from the JWT payload.
 * Token is stored in httpOnly cookies, so this only decodes
 * the non-sensitive payload on the client side for UI purposes.
 * All security decisions are enforced by the Django backend.
 */

import { jwtDecode } from "jwt-decode";

export type UserRole = "trader" | "mentor" | "admin";

export interface TokenPayload {
  user_id: number;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/**
 * Read and decode the access token from document.cookie.
 * Returns null if no token is present or if it's malformed.
 * Note: httpOnly cookies are NOT accessible here — this reads
 * the non-httpOnly claims only. Role enforcement happens in middleware.ts.
 */
export function getTokenPayload(): TokenPayload | null {
  if (typeof document === "undefined") return null;

  // The access_token cookie is httpOnly in production.
  // For UI purposes (greeting, role display), we rely on the /api/auth/me/ endpoint.
  // This function exists as a fallback for non-sensitive reads.
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (!match) return null;

  try {
    return jwtDecode<TokenPayload>(match[1]);
  } catch {
    return null;
  }
}

/** Check whether the current token is expired (client-side only). */
export function isTokenExpired(payload: TokenPayload): boolean {
  return Date.now() / 1000 >= payload.exp;
}

/** Logout — calls the backend to blacklist the refresh token, then redirects. */
export async function logout(): Promise<void> {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/auth/logout/`,
      { method: "POST", credentials: "include" },
    );
  } catch {
    // Even if the API call fails, clear local state and redirect
  } finally {
    window.location.href = "/login";
  }
}
