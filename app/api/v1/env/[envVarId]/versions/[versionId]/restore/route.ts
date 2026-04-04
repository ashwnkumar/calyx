/**
 * POST /api/v1/env/:envVarId/versions/:versionId/restore — Restore to a previous version
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID } from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const POST = withAuth(
  async (_request, { user, supabase }, params) => {
    const envVarId = validateUUID(params.envVarId, "env var ID");
    const versionId = validateUUID(params.versionId, "version ID");

    // Fetch the version to restore
    const { data: version, error: versionError } = await supabase
      .from("env_var_versions")
      .select("name, iv, ciphertext, env_var_id")
      .eq("id", versionId)
      .eq("user_id", user.id)
      .single();

    if (versionError || !version) {
      throw new ApiError(404, "Version not found");
    }

    if (version.env_var_id !== envVarId) {
      throw new ApiError(400, "Version does not belong to this env var");
    }

    // Update current env_var with version data (DB trigger creates new version)
    const { error: updateError } = await supabase
      .from("env_vars")
      .update({
        name: version.name,
        iv: version.iv,
        ciphertext: version.ciphertext,
        updated_at: new Date().toISOString(),
      })
      .eq("id", envVarId)
      .eq("user_id", user.id);

    if (updateError) {
      throw new ApiError(500, "Failed to restore version");
    }

    // Get project_id for revalidation
    const { data: envVar } = await supabase
      .from("env_vars")
      .select("project_id")
      .eq("id", envVarId)
      .single();

    if (envVar?.project_id) {
      revalidatePath(`/projects/${envVar.project_id}`);
    }

    return success({ restored: true });
  },
  { rateLimit: RATE_LIMITS.write },
);
