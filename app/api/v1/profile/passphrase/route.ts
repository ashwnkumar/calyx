/**
 * PUT /api/v1/profile/passphrase
 *
 * Updates the test_iv + test_ciphertext on the user's profile.
 * Used for:
 * - First-time passphrase setup (after initial unlock)
 * - Passphrase change (new test blob encrypted with new key)
 *
 * Body: { test_iv: string, test_ciphertext: string }
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { validateBase64 } from "@/lib/api/validation";
import { ApiError } from "@/lib/types/api";

export const PUT = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();

    // Validate encrypted payload
    const testIv = validateBase64(body.test_iv, "test_iv", 12);
    const testCiphertext = validateBase64(
      body.test_ciphertext,
      "test_ciphertext",
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        test_iv: testIv,
        test_ciphertext: testCiphertext,
      })
      .eq("id", user.id);

    if (updateError) {
      throw new ApiError(500, "Failed to update passphrase verification data");
    }

    return success({ updated: true });
  },
  { rateLimit: RATE_LIMITS.sensitive },
);
