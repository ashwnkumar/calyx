/**
 * Standardized API response helpers
 */

import { NextResponse } from "next/server";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
  "X-Frame-Options": "DENY",
};

/**
 * Return a success JSON response
 */
export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status, headers: SECURITY_HEADERS },
  );
}

/**
 * Return an error JSON response
 */
export function error(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: SECURITY_HEADERS },
  );
}
