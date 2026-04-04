/**
 * POST   /api/v1/projects/:id/env — Add encrypted env file
 * DELETE /api/v1/projects/:id/env — Batch delete env files
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import {
  validateUUID,
  validateBase64,
  validateRequiredString,
} from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const POST = withAuth(
  async (request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");
    const body = await request.json();

    const name = validateRequiredString(body.name, "name", 100);
    const iv = validateBase64(body.iv, "iv", 12);
    const ciphertext = validateBase64(body.ciphertext, "ciphertext");

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      throw new ApiError(404, "Project not found or access denied");
    }

    const { data: insertedFile, error: insertError } = await supabase
      .from("env_vars")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name,
        iv,
        ciphertext,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        throw new ApiError(
          409,
          `An environment file named "${name}" already exists in this project`,
        );
      }
      throw new ApiError(
        500,
        "Failed to add environment file. Please try again.",
      );
    }

    revalidatePath(`/projects/${projectId}`);
    return success(insertedFile, 201);
  },
  { rateLimit: RATE_LIMITS.write },
);

export const DELETE = withAuth(
  async (request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");
    const body = await request.json();

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      throw new ApiError(400, "ids must be a non-empty array");
    }
    if (body.ids.length > 50) {
      throw new ApiError(400, "Cannot delete more than 50 files at once");
    }

    // Validate each ID
    for (const id of body.ids) {
      validateUUID(id, "env file ID");
    }

    const { error: deleteError, count } = await supabase
      .from("env_vars")
      .delete({ count: "exact" })
      .in("id", body.ids)
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw new ApiError(
        500,
        "Failed to delete environment files. Please try again.",
      );
    }

    revalidatePath(`/projects/${projectId}`);
    return success({ count: count ?? 0 });
  },
  { rateLimit: RATE_LIMITS.write },
);
