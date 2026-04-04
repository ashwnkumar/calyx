/**
 * GET /api/v1/env/:envVarId/versions/:versionId — Get a specific version
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID } from "@/lib/api/validation";

export const GET = withAuth(
  async (_request, { user, supabase }, params) => {
    const envVarId = validateUUID(params.envVarId, "env var ID");
    const versionId = validateUUID(params.versionId, "version ID");

    const { data, error } = await supabase
      .from("env_var_versions")
      .select("*")
      .eq("id", versionId)
      .eq("env_var_id", envVarId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "Version not found");
    }

    return success(data);
  },
  { rateLimit: RATE_LIMITS.read },
);
