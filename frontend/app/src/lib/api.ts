/**
 * Central API client for all requests to api.tradalyst.com.
 * - Reads JWT from httpOnly cookie automatically (credentials: "include")
 * - Handles 401 → silent token refresh → single retry
 * - Throws ApiError with status + message on failure
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the 401 refresh retry (used internally to avoid infinite loops) */
  _skipRefresh?: boolean;
}

async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, _skipRefresh, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, init);

  // 401 — try a token refresh once, then retry
  if (res.status === 401 && !_skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return api<T>(path, { ...options, _skipRefresh: true });
    }
    // Refresh failed — redirect to login on the client side
    if (typeof window !== "undefined") {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data?.detail ?? data?.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const get = <T = unknown>(path: string, options?: RequestOptions) =>
  api<T>(path, { method: "GET", ...options });

export const post = <T = unknown>(path: string, body: unknown, options?: RequestOptions) =>
  api<T>(path, { method: "POST", body, ...options });

export const patch = <T = unknown>(path: string, body: unknown, options?: RequestOptions) =>
  api<T>(path, { method: "PATCH", body, ...options });

export const put = <T = unknown>(path: string, body: unknown, options?: RequestOptions) =>
  api<T>(path, { method: "PUT", body, ...options });

export const del = <T = unknown>(path: string, options?: RequestOptions) =>
  api<T>(path, { method: "DELETE", ...options });
