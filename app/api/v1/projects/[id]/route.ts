/**
 * GET    /api/v1/projects/:id — Get project detail + env files
 * PATCH  /api/v1/projects/:id — Update project name and/or description
 * DELETE /api/v1/projects/:id — Delete project (cascade)
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import {
  validateUUID,
  validateRequiredString,
  validateOptionalString,
} from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const GET = withAuth(
  async (_request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");

    const [projectResult, envResult] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, description, created_at, updated_at")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("env_vars")
        .select(
          "id, project_id, user_id, name, iv, ciphertext, created_at, updated_at",
        )
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (projectResult.error || !projectResult.data) {
      throw new ApiError(404, "Project not found or access denied");
    }

    return success({
      project: projectResult.data,
      env_files: envResult.data ?? [],
    });
  },
  { rateLimit: RATE_LIMITS.read },
);

export const PATCH = withAuth(
  async (request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");
    const body = await request.json();

    // At least one field must be provided
    if (body.name === undefined && body.description === undefined) {
      throw new ApiError(400, "Provide at least one of: name, description");
    }

    const updates: Record<string, unknown> = {};

    // Validate and prepare name update
    if (body.name !== undefined) {
      const name = validateRequiredString(body.name, "name", 100);

      // Check for duplicate name (excluding current project)
      const { data: existing } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", name)
        .neq("id", projectId)
        .single();

      if (existing) {
        throw new ApiError(409, "A project with this name already exists");
      }

      updates.name = name;
    }

    // Validate and prepare description update
    if (body.description !== undefined) {
      updates.description = validateOptionalString(
        body.description,
        "description",
        500,
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select("id, name, description")
      .single();

    if (updateError || !updated) {
      throw new ApiError(500, "Failed to update project. Please try again.");
    }

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);

    return success(updated);
  },
  { rateLimit: RATE_LIMITS.write },
);

export const DELETE = withAuth(
  async (_request, { user, supabase }, params) => {
    const projectId = validateUUID(params.id, "project ID");

    // Verify ownership
    const { data: project, error: findError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (findError || !project) {
      throw new ApiError(404, "Project not found or access denied");
    }

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw new ApiError(500, "Failed to delete project. Please try again.");
    }

    revalidatePath("/dashboard");

    return success({ id: projectId });
  },
  { rateLimit: RATE_LIMITS.write },
);
