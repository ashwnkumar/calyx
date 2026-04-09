/**
 * DELETE /api/v1/profile/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Requires email confirmation in the request body as a safety check.
 *
 * Body: { confirm_email: string }
 *
 * Deletion order:
 * 1. env_vars (user's encrypted variables)
 * 2. projects (user's projects)
 * 3. profiles (user's profile row)
 * 4. auth.users (Supabase auth user — requires admin client)
 */

import { withAuth } from "@/lib/api/with-auth";
import { success } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import { createAdminClient } from "@/lib/supabase/admin";

export const DELETE = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();
    const confirmEmail = body?.confirm_email;

    if (!confirmEmail || typeof confirmEmail !== "string") {
      throw new ApiError(400, "Email confirmation is required");
    }

    if (confirmEmail.toLowerCase() !== user.email?.toLowerCase()) {
      throw new ApiError(400, "Email does not match your account");
    }

    // 1. Delete all env_vars owned by this user
    const { error: envError } = await supabase
      .from("env_vars")
      .delete()
      .eq("user_id", user.id);

    if (envError) {
      console.error("Failed to delete env_vars:", envError);
      throw new ApiError(500, "Failed to delete environment variables");
    }

    // 2. Delete all projects owned by this user
    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .eq("user_id", user.id);

    if (projectsError) {
      console.error("Failed to delete projects:", projectsError);
      throw new ApiError(500, "Failed to delete projects");
    }

    // 3. Delete profile row
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
      throw new ApiError(500, "Failed to delete profile");
    }

    // 4. Delete auth user (requires service role)
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      user.id,
    );

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      throw new ApiError(500, "Failed to delete authentication account");
    }

    return success({ deleted: true });
  },
  { rateLimit: RATE_LIMITS.sensitive },
);
