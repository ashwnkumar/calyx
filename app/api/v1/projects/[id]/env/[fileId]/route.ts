/**
 * PATCH /api/v1/projects/:id/env/:fileId — Update env file content (iv + ciphertext)
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { validateUUID, validateBase64 } from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const PATCH = withAuth(
  async (request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");
    const fileId = validateUUID(params.fileId, "file ID");
    const body = await request.json();

    const iv = validateBase64(body.iv, "iv", 12);
    const ciphertext = validateBase64(body.ciphertext, "ciphertext");

    const { data: updatedFile, error: updateError } = await supabase
      .from("env_vars")
      .update({
        iv,
        ciphertext,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError || !updatedFile) {
      throw new ApiError(
        500,
        "Failed to update environment file. Please try again.",
      );
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/env/${fileId}`);

    return success(updatedFile);
  },
  { rateLimit: RATE_LIMITS.write },
);
