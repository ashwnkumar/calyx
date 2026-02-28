/**
 * Environment variable validation functions
 * Plain JavaScript validation without external libraries
 */

import { parseEnvContent } from "@/lib/parsers/env-parser";

export type EnvFormData = {
  content: string;
};

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string };

/**
 * Validates environment variable form data
 * @param data - The env variable form data to validate
 * @returns ValidationResult with validated data or error message
 */
export function validateEnvFormData(
  data: EnvFormData,
): ValidationResult<EnvFormData> {
  const content = data.content?.trim() || "";

  // Content is required
  if (!content) {
    return { valid: false, error: "Content is required" };
  }

  // Parse content to check for valid key-value pairs
  const parsed = parseEnvContent(content);
  if (parsed.length === 0) {
    return {
      valid: false,
      error: "No valid environment variables found. Use KEY=value format.",
    };
  }

  return { valid: true, data: { content } };
}
