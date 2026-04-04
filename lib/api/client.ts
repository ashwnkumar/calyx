/**
 * Typed API client for Calyx
 *
 * Used by client components to call /api/v1/ endpoints.
 * Handles JSON parsing, error extraction, and type safety.
 */

import type { ApiResponse } from "@/lib/types/api";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Call an API endpoint and return typed data.
 * Throws on network errors or API error responses.
 */
export async function apiClient<T>(
  path: string,
  options?: FetchOptions,
): Promise<T> {
  const { body, headers, ...rest } = options ?? {};

  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.error || `API error (${res.status})`);
  }

  return json.data;
}
