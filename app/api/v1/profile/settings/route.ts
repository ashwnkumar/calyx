/**
 * PATCH /api/v1/profile/settings
 *
 * Shallow-merges the provided keys into the profile's settings JSONB column.
 * Body: Record<string, unknown>  (e.g. { has_seen_tour: true })
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";

export const PATCH = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError(400, "Request body must be a JSON object");
    }

    // Fetch current settings to merge
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", user.id)
      .single();

    if (fetchError || !profile) {
      throw new ApiError(404, "Profile not found");
    }

    const merged = { ...(profile.settings ?? {}), ...body };

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ settings: merged })
      .eq("id", user.id);

    if (updateError) {
      throw new ApiError(500, "Failed to update settings");
    }

    return success({ settings: merged });
  },
  { rateLimit: RATE_LIMITS.write },
);
