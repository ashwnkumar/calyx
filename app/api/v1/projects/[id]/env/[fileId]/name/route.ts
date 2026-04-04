/**
 * PATCH /api/v1/projects/:id/env/:fileId/name — Rename env file
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID, validateRequiredString } from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const PATCH = withAuth(
  async (request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");
    const fileId = validateUUID(params.fileId, "file ID");
    const body = await request.json();

    const name = validateRequiredString(body.name, "name", 100);

    const { data: updatedFile, error: updateError } = await supabase
      .from("env_vars")
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        throw new ApiError(
          409,
          `An environment file named "${name}" already exists in this project`,
        );
      }
      throw new ApiError(
        500,
        "Failed to update environment file name. Please try again.",
      );
    }

    if (!updatedFile) {
      throw new ApiError(404, "Environment file not found");
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/env/${fileId}`);

    return success(updatedFile);
  },
  { rateLimit: RATE_LIMITS.write },
);
