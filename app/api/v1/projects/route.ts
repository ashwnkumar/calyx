/**
 * GET  /api/v1/projects — List all projects with env_vars count
 * POST /api/v1/projects — Create a new project
 */

import { withAuth } from "@/lib/api/with-auth";
import { success, error } from "@/lib/api/response";
import { RATE_LIMITS } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/types/api";
import {
  validateRequiredString,
  validateOptionalString,
} from "@/lib/api/validation";
import { revalidatePath } from "next/cache";

export const GET = withAuth(
  async (_request, { user, supabase }) => {
    const { data: projects, error: dbError } = await supabase
      .from("projects")
      .select(
        "id, user_id, name, description, created_at, updated_at, env_vars(count)",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (dbError) {
      throw new ApiError(500, "Failed to fetch projects");
    }

    return success(projects ?? []);
  },
  { rateLimit: RATE_LIMITS.read },
);

export const POST = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();

    const name = validateRequiredString(body.name, "name", 100);
    const description = validateOptionalString(
      body.description,
      "description",
      500,
    );

    // Check for duplicate name
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();

    if (existing) {
      throw new ApiError(409, "A project with this name already exists");
    }

    const { data: project, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select("*, env_vars(count)")
      .single();

    if (createError) {
      throw new ApiError(500, "Failed to create project. Please try again.");
    }

    revalidatePath("/dashboard");

    return success(project, 201);
  },
  { rateLimit: RATE_LIMITS.write },
);
