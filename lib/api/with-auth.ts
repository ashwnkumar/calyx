/**
 * Higher-order wrapper for API route handlers.
 * Provides: authentication, rate limiting, error handling, security headers.
 *
 * Usage:
 *   export const GET = withAuth(async (req, ctx) => {
 *     const projects = ...;
 *     return success(projects);
 *   }, { rateLimit: RATE_LIMITS.read });
 */

import { type NextRequest } from "next/server";
import { authenticateRequest, type AuthContext } from "@/lib/api/auth";
import {
  error as errorResponse,
  preflight as preflightResponse,
} from "@/lib/api/response";
import { ApiError } from "@/lib/types/api";
import {
  rateLimit as checkRateLimit,
  type RATE_LIMITS,
} from "@/lib/api/rate-limit";

type RateLimitConfig = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];

type HandlerOptions = {
  /** Rate limit tier to apply. Omit to skip rate limiting. */
  rateLimit?: RateLimitConfig;
  /** Max request body size in bytes. Default: 102_400 (100KB). */
  maxBodySize?: number;
};

type RouteParams = {
  params: Promise<Record<string, string>>;
};

type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext,
  params: Record<string, string>,
) => Promise<Response>;

/**
 * Wrap an API route handler with auth, rate limiting, and error handling.
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options?: HandlerOptions,
) {
  const { rateLimit: rateLimitConfig, maxBodySize = 102_400 } = options ?? {};

  return async (request: NextRequest, routeParams?: RouteParams) => {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return preflightResponse(request.headers.get("origin"));
    }

    const origin = request.headers.get("origin");

    try {
      // 1. Authenticate
      const authCtx = await authenticateRequest();

      // 2. Rate limit (keyed by user ID)
      if (rateLimitConfig) {
        const result = checkRateLimit(
          `${authCtx.user.id}:${request.nextUrl.pathname}`,
          rateLimitConfig,
        );

        if (!result.allowed) {
          return errorResponse(
            "Too many requests. Please try again later.",
            429,
            origin,
          );
        }
      }

      // 3. Body size check (only for methods that have a body)
      if (
        request.method !== "GET" &&
        request.method !== "HEAD" &&
        request.method !== "DELETE"
      ) {
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > maxBodySize) {
          return errorResponse("Request body too large", 413, origin);
        }
      }

      // 4. Resolve route params
      const params = routeParams?.params ? await routeParams.params : {};

      // 5. Execute handler
      return await handler(request, authCtx, params);
    } catch (err) {
      // Known API errors → proper status code
      if (err instanceof ApiError) {
        return errorResponse(err.message, err.statusCode, origin);
      }

      // Unexpected errors → 500, never leak internals
      console.error("Unhandled API error:", err);
      return errorResponse("Internal server error", 500, origin);
    }
  };
}
