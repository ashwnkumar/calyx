"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Encrypted environment file update data
 */
type EncryptedEnvFileUpdate = {
  iv: string;
  ciphertext: string;
};

/**
 * Standard action result type
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Environment file record
 */
type EnvFile = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

/**
 * Server Action: Update encrypted environment file content
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies file ownership (RLS enforcement)
 * 3. Updates encrypted content in Supabase
 * 4. Revalidates the file details page cache
 *
 * @param projectId - UUID of the project
 * @param fileId - UUID of the env file to update
 * @param encryptedUpdate - New encrypted content (iv + ciphertext)
 * @returns ActionResult with updated record or error message
 */
export async function updateEnvFile(
  projectId: string,
  fileId: string,
  encryptedUpdate: EncryptedEnvFileUpdate,
): Promise<ActionResult<EnvFile>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Update env file
  const { data: updatedFile, error: updateError } = await supabase
    .from("env_vars")
    .update({
      iv: encryptedUpdate.iv,
      ciphertext: encryptedUpdate.ciphertext,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error("Env file update error:", updateError);
    return {
      success: false,
      error: "Failed to update environment file. Please try again.",
    };
  }

  // Revalidate pages
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/env/${fileId}`);

  return {
    success: true,
    data: updatedFile as EnvFile,
  };
}

/**
 * Server Action: Update environment file name
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies file ownership (RLS enforcement)
 * 3. Updates file name in Supabase
 * 4. Revalidates the file details page cache
 *
 * @param projectId - UUID of the project
 * @param fileId - UUID of the env file to update
 * @param newName - New name for the env file
 * @returns ActionResult with updated record or error message
 */
export async function updateEnvFileName(
  projectId: string,
  fileId: string,
  newName: string,
): Promise<ActionResult<EnvFile>> {
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
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, error: "Name cannot be empty" };
  }

  // Update env file name
  const { data: updatedFile, error: updateError } = await supabase
    .from("env_vars")
    .update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error("Env file name update error:", updateError);

    // Check for unique constraint violation
    if (updateError.code === "23505") {
      return {
        success: false,
        error: `An environment file named "${trimmedName}" already exists in this project`,
      };
    }

    return {
      success: false,
      error: "Failed to update environment file name. Please try again.",
    };
  }

  // Revalidate pages
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/env/${fileId}`);

  return {
    success: true,
    data: updatedFile as EnvFile,
  };
}
