/**
 * PUT /api/v1/env/bulk-update — Batch update iv+ciphertext for multiple env_vars
 *
 * Used by changePassphrase flow: re-encrypt all env_vars with new key.
 * Body: { updates: [{ id, iv, ciphertext }] }
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID, validateBase64 } from "@/lib/api/validation";

export const PUT = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();

    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      throw new ApiError(400, "updates must be a non-empty array");
    }
    if (body.updates.length > 200) {
      throw new ApiError(400, "Cannot update more than 200 entries at once");
    }

    // Validate every entry upfront before touching the DB
    const validated = body.updates.map(
      (
        entry: { id: unknown; iv: unknown; ciphertext: unknown },
        i: number,
      ) => ({
        id: validateUUID(entry.id, `updates[${i}].id`),
        iv: validateBase64(entry.iv, `updates[${i}].iv`, 12),
        ciphertext: validateBase64(
          entry.ciphertext,
          `updates[${i}].ciphertext`,
        ),
      }),
    );

    // Execute all updates — each scoped to user_id for safety
    let updatedCount = 0;
    const errors: string[] = [];

    for (const entry of validated) {
      const { error } = await supabase
        .from("env_vars")
        .update({
          iv: entry.iv,
          ciphertext: entry.ciphertext,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id)
        .eq("user_id", user.id);

      if (error) {
        errors.push(`Failed to update ${entry.id}`);
      } else {
        updatedCount++;
      }
    }

    if (errors.length > 0 && updatedCount === 0) {
      throw new ApiError(500, "Bulk update failed completely");
    }

    return success({
      updated: updatedCount,
      total: validated.length,
      partial: errors.length > 0,
    });
  },
  { rateLimit: RATE_LIMITS.bulk, maxBodySize: 1_048_576 },
);

/**
 * GET /api/v1/env/bulk-update — Fetch all env_vars for the current user
 *
 * Used by changePassphrase flow: need all env_vars to re-encrypt.
 * Returns only id, iv, ciphertext (minimal payload for re-encryption).
 */
export const GET = withAuth(
  async (_request, { user, supabase }) => {
    const { data, error } = await supabase
      .from("env_vars")
      .select("id, iv, ciphertext")
      .eq("user_id", user.id);

    if (error) {
      throw new ApiError(500, "Failed to fetch environment variables");
    }

    return success(data ?? []);
  },
  { rateLimit: RATE_LIMITS.read },
);
