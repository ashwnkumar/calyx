"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateProjectData } from "@/lib/validations/project";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server Action to create a new project
 * @param formData - FormData containing name and description
 * @returns ActionResult with created project or error message
 */
export async function createProject(
  formData: FormData,
): Promise<ActionResult<Project>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Extract and validate input
  const rawData = {
    name: (formData.get("name") as string) || "",
    description: (formData.get("description") as string) || "",
  };

  const validation = validateProjectData(rawData);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const { name, description } = validation.data;

  // Check for duplicate name
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", name)
    .single();

  if (existing) {
    return {
      success: false,
      error: "A project with this name already exists",
    };
  }

  // Create project
  const { data: project, error: createError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
    })
    .select("*, env_vars(count)")
    .single();

  if (createError) {
    console.error("Project creation error:", createError);
    return {
      success: false,
      error: "Failed to create project. Please try again.",
    };
  }

  // Revalidate the dashboard page
  revalidatePath("/");

  return {
    success: true,
    data: project,
  };
}

/**
 * Server Action to delete a project
 * @param projectId - UUID of the project to delete
 * @returns ActionResult with success status or error message
 */
export async function deleteProject(
  projectId: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return { success: false, error: "Project not found or access denied" };
  }

  // Delete project (cascade will delete associated env_vars via database constraint)
  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Project deletion error:", deleteError);
    return {
      success: false,
      error: "Failed to delete project. Please try again.",
    };
  }

  // Revalidate the dashboard page
  revalidatePath("/");

  return {
    success: true,
    data: { id: projectId },
  };
}

/**
 * Server Action to update a project's name
 * @param projectId - UUID of the project to update
 * @param name - New name for the project
 * @returns ActionResult with updated project or error message
 */
export async function updateProjectName(
  projectId: string,
  name: string,
): Promise<ActionResult<{ id: string; name: string }>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate name
  const validation = validateProjectData({ name, description: "" });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const trimmedName = name.trim();

  // Check for duplicate name (excluding current project)
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", trimmedName)
    .neq("id", projectId)
    .single();

  if (existing) {
    return {
      success: false,
      error: "A project with this name already exists",
    };
  }

  // Update project name
  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({ name: trimmedName })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id, name")
    .single();

  if (updateError || !updated) {
    console.error("Project update error:", updateError);
    return {
      success: false,
      error: "Failed to update project name. Please try again.",
    };
  }

  // Revalidate both dashboard and project details pages
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: updated,
  };
}

/**
 * Server Action to update a project's description
 * @param projectId - UUID of the project to update
 * @param description - New description (can be null for empty)
 * @returns ActionResult with updated project or error message
 */
export async function updateProjectDescription(
  projectId: string,
  description: string | null,
): Promise<ActionResult<{ id: string; description: string | null }>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Update project description
  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({ description: description || null })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id, description")
    .single();

  if (updateError || !updated) {
    console.error("Project description update error:", updateError);
    return {
      success: false,
      error: "Failed to update project description. Please try again.",
    };
  }

  // Revalidate both dashboard and project details pages
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: updated,
  };
}
