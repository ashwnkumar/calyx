"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Encrypted environment file data structure
 * Received from client after encryption with user's cryptoKey
 */
type EncryptedEnvFile = {
  name: string; // Environment file name (e.g., "production", "development")
  iv: string; // Base64-encoded initialization vector (12 bytes)
  ciphertext: string; // Base64-encoded encrypted entire .env file content
};

/**
 * Standard action result type for success/error handling
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Environment file record as stored in database
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
 * Server Action: Add encrypted environment file to a project
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies project ownership (RLS enforcement)
 * 3. Inserts encrypted env_vars record into Supabase
 * 4. Revalidates the project details page cache
 *
 * @param projectId - UUID of the project to add env file to
 * @param encryptedFile - Encrypted environment file data
 * @returns ActionResult with inserted record or error message
 */
export async function addEnvFile(
  projectId: string,
  encryptedFile: EncryptedEnvFile,
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

  // Prepare record for insertion
  const record = {
    project_id: projectId,
    user_id: user.id,
    name: encryptedFile.name,
    iv: encryptedFile.iv,
    ciphertext: encryptedFile.ciphertext,
  };

  // Insert env_vars into database
  const { data: insertedFile, error: insertError } = await supabase
    .from("env_vars")
    .insert(record)
    .select()
    .single();

  if (insertError) {
    console.error("Env file insertion error:", insertError);

    // Check for unique constraint violation
    if (insertError.code === "23505") {
      return {
        success: false,
        error: `An environment file named "${encryptedFile.name}" already exists in this project`,
      };
    }

    return {
      success: false,
      error: "Failed to add environment file. Please try again.",
    };
  }

  // Revalidate the project details page to show new env file
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: insertedFile as EnvFile,
  };
}

/**
 * Server Action: Delete environment files from a project
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies ownership of each env file (RLS enforcement)
 * 3. Deletes the specified env_vars records from Supabase
 * 4. Revalidates the project details page cache
 *
 * @param projectId - UUID of the project containing the env files
 * @param envFileIds - Array of env file UUIDs to delete
 * @returns ActionResult with count of deleted records or error message
 */
export async function deleteEnvFiles(
  projectId: string,
  envFileIds: string[],
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate input
  if (!envFileIds || envFileIds.length === 0) {
    return { success: false, error: "No environment files specified" };
  }

  // Delete env_vars
  // RLS policies enforce that user can only delete their own records
  const { error: deleteError, count } = await supabase
    .from("env_vars")
    .delete({ count: "exact" })
    .in("id", envFileIds)
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Env file deletion error:", deleteError);
    return {
      success: false,
      error: "Failed to delete environment files. Please try again.",
    };
  }

  // Revalidate the project details page to reflect deletions
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: { count: count ?? 0 },
  };
}
