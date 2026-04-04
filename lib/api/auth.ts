/**
 * API authentication helper
 * Centralizes the repeated getUser() + null-check pattern
 */

import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/types/api";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AuthContext = {
  user: User;
  supabase: SupabaseClient;
};

/**
 * Authenticate the current request via Supabase session cookie.
 * Throws ApiError(401) if no valid session exists.
 */
export async function authenticateRequest(): Promise<AuthContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "Unauthorized");
  }

  return { user, supabase };
}
