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
    .select()
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
