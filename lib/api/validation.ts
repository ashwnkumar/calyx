/**
 * Input validation helpers for API route handlers
 * All validators throw ApiError so they can be caught by withAuth wrapper.
 */

import { ApiError } from "@/lib/types/api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches a valid base64 string (standard alphabet, optional padding)
const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/**
 * Validate that `value` is a valid UUID. Throws 400 if not.
 */
export function validateUUID(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    throw new ApiError(400, `Invalid UUID for ${fieldName}`);
  }
  return value;
}

/**
 * Validate that `value` is a valid base64 string.
 * Optionally checks decoded byte length (e.g. 12 for AES-GCM IV).
 */
export function validateBase64(
  value: unknown,
  fieldName: string,
  expectedByteLength?: number,
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `${fieldName} is required`);
  }

  if (!BASE64_RE.test(value)) {
    throw new ApiError(400, `${fieldName} must be valid base64`);
  }

  if (expectedByteLength !== undefined) {
    // Decode and check length
    try {
      const decoded = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
      if (decoded.length !== expectedByteLength) {
        throw new ApiError(
          400,
          `${fieldName} must decode to exactly ${expectedByteLength} bytes`,
        );
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(400, `${fieldName} contains invalid base64`);
    }
  }

  return value;
}

/**
 * Validate a required non-empty string, trimmed, with optional max length.
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string,
  maxLength?: number,
): string {
  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} is required`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ApiError(400, `${fieldName} cannot be empty`);
  }

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ApiError(
      400,
      `${fieldName} must be ${maxLength} characters or fewer`,
    );
  }

  return trimmed;
}

/**
 * Validate an optional string with max length. Returns trimmed value or null.
 */
export function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength?: number,
): string | null {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ApiError(
      400,
      `${fieldName} must be ${maxLength} characters or fewer`,
    );
  }

  return trimmed;
}
