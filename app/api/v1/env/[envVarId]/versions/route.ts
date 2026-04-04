/**
 * GET /api/v1/env/:envVarId/versions — List version history for an env var
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID } from "@/lib/api/validation";

export const GET = withAuth(
  async (_request, { user, supabase }, params) => {
    const envVarId = validateUUID(params.envVarId, "env var ID");

    const { data, error } = await supabase
      .from("env_var_versions")
      .select("*")
      .eq("env_var_id", envVarId)
      .eq("user_id", user.id)
      .order("version_number", { ascending: false });

    if (error) {
      throw new ApiError(500, "Failed to load version history");
    }

    return success(data ?? []);
  },
  { rateLimit: RATE_LIMITS.read },
);
