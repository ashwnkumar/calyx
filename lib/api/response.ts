/**
 * Standardized API response helpers
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/** Allowed origins — expand for VSCode extension later */
const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4321",
]);

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "X-Frame-Options": "DENY",
    "X-Request-Id": randomUUID(),
  };

  // Only set CORS headers if origin is allowed
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    headers["Access-Control-Max-Age"] = "86400";
  }

  return headers;
}

/**
 * Return a success JSON response
 */
export function success<T>(
  data: T,
  status = 200,
  origin?: string | null,
): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status, headers: getCorsHeaders(origin) },
  );
}

/**
 * Return an error JSON response
 */
export function error(
  message: string,
  status = 400,
  origin?: string | null,
): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: getCorsHeaders(origin) },
  );
}

/**
 * Return a CORS preflight response (204 No Content)
 */
export function preflight(origin?: string | null): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
