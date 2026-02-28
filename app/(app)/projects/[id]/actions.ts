"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Encrypted environment variable data structure
 * Received from client after encryption with user's cryptoKey
 */
type EncryptedEnvVar = {
  key: string; // Environment variable key (e.g., "DATABASE_URL")
  iv: string; // Base64-encoded initialization vector (12 bytes)
  ciphertext: string; // Base64-encoded encrypted value
};

/**
 * Standard action result type for success/error handling
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Environment variable record as stored in database
 */
type EnvVariable = {
  id: string;
  project_id: string;
  user_id: string;
  key: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

/**
 * Server Action: Add encrypted environment variables to a project
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies project ownership (RLS enforcement)
 * 3. Inserts encrypted env_vars records into Supabase
 * 4. Revalidates the project details page cache
 *
 * @param projectId - UUID of the project to add env vars to
 * @param encryptedVars - Array of encrypted environment variables
 * @returns ActionResult with inserted records or error message
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export async function addEnvVariables(
  projectId: string,
  encryptedVars: EncryptedEnvVar[],
): Promise<ActionResult<EnvVariable[]>> {
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
  // RLS policies will enforce user_id matching, but we check explicitly
  // to provide better error messages
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return { success: false, error: "Project not found or access denied" };
  }

  // Prepare records for insertion
  // Each record includes project_id, user_id, and encrypted data
  const records = encryptedVars.map((v) => ({
    project_id: projectId,
    user_id: user.id,
    key: v.key,
    iv: v.iv,
    ciphertext: v.ciphertext,
  }));

  // Insert env_vars into database
  // RLS policies enforce that user can only insert their own records
  const { data: insertedVars, error: insertError } = await supabase
    .from("env_vars")
    .insert(records)
    .select();

  if (insertError) {
    console.error("Env var insertion error:", insertError);
    return {
      success: false,
      error: "Failed to add environment variables. Please try again.",
    };
  }

  // Revalidate the project details page to show new env vars
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: insertedVars as EnvVariable[],
  };
}

/**
 * Server Action: Delete environment variables from a project
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Verifies ownership of each env var (RLS enforcement)
 * 3. Deletes the specified env_vars records from Supabase
 * 4. Revalidates the project details page cache
 *
 * @param projectId - UUID of the project containing the env vars
 * @param envVarIds - Array of env var UUIDs to delete
 * @returns ActionResult with count of deleted records or error message
 */
export async function deleteEnvVariables(
  projectId: string,
  envVarIds: string[],
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
  if (!envVarIds || envVarIds.length === 0) {
    return { success: false, error: "No environment variables specified" };
  }

  // Delete env_vars
  // RLS policies enforce that user can only delete their own records
  const { error: deleteError, count } = await supabase
    .from("env_vars")
    .delete({ count: "exact" })
    .in("id", envVarIds)
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Env var deletion error:", deleteError);
    return {
      success: false,
      error: "Failed to delete environment variables. Please try again.",
    };
  }

  // Revalidate the project details page to reflect deletions
  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    data: { count: count ?? 0 },
  };
}
