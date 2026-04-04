/**
 * GET /api/v1/profile
 *
 * Returns the current user's profile data needed for client-side crypto:
 * - encryption_salt: for key derivation
 * - test_iv / test_ciphertext: for passphrase verification (encrypted, not secret)
 * - has_passphrase: convenience boolean
 */

import { withAuth } from "@/lib/api/with-auth";
import { success, error } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";

export const GET = withAuth(
  async (_request, { supabase }) => {
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("encryption_salt, test_iv, test_ciphertext")
      .single();

    if (dbError || !profile) {
      throw new ApiError(404, "Profile not found");
    }

    if (!profile.encryption_salt) {
      throw new ApiError(500, "Profile is missing encryption salt");
    }

    return success({
      encryption_salt: profile.encryption_salt,
      test_iv: profile.test_iv ?? null,
      test_ciphertext: profile.test_ciphertext ?? null,
      has_passphrase: !!(profile.test_iv && profile.test_ciphertext),
    });
  },
  { rateLimit: RATE_LIMITS.sensitive },
);
