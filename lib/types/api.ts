/**
 * Shared API types for Calyx
 * Single source of truth — replaces per-file ActionResult<T> definitions
 */

// ── Response envelope ──────────────────────────────────────────────

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── Domain models ──────────────────────────────────────────────────

export type Profile = {
  id: string;
  encryption_salt: string;
  has_passphrase: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

export type EnvFile = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

export type EnvVarVersion = {
  id: string;
  env_var_id: string;
  version_number: number;
  change_type: "created" | "updated" | "deleted";
  changed_at: string;
  change_note: string | null;
  name: string;
  iv: string;
  ciphertext: string;
};

// ── HTTP error (thrown inside route handlers, caught by withAuth) ──

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
