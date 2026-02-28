import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/projects/error-state";
import { ProjectDetailsClient } from "@/components/env-variables/project-details-client";

/**
 * Validates if a string is a valid UUID v4 format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

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

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();

  const { id: projectId } = await params;
  const supabase = await createClient();

  // Validate UUID format
  if (!isValidUUID(projectId)) {
    return (
      <ErrorState message="Invalid project ID. Please check the URL and try again." />
    );
  }

  // Fetch project metadata with RLS enforcement
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, created_at, updated_at")
    .eq("id", projectId)
    .single();

  // Handle project not found or access denied (RLS)
  if (projectError || !project) {
    return (
      <ErrorState message="Project not found or you don't have access to it." />
    );
  }

  // Fetch env_vars for this project ordered by created_at (newest first)
  const { data: envVars, error: envError } = await supabase
    .from("env_vars")
    .select(
      "id, project_id, user_id, key, iv, ciphertext, created_at, updated_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Log error but continue with empty array rather than failing completely
  if (envError) {
    console.error("Failed to fetch env vars:", envError);
  }

  return (
    <ProjectDetailsClient
      project={project as Project}
      initialEnvVars={(envVars as EnvVariable[]) ?? []}
    />
  );
}
