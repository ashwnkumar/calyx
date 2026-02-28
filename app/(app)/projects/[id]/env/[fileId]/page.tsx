import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/projects/error-state";
import { EnvFileDetailsClient } from "@/components/env-variables/env-file-details-client";

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
};

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

export default async function EnvFileDetailsPage({
  params,
}: {
  params: Promise<{ id: string; fileId: string }>;
}) {
  noStore();

  const { id: projectId, fileId } = await params;
  const supabase = await createClient();

  // Validate UUID formats
  if (!isValidUUID(projectId) || !isValidUUID(fileId)) {
    return (
      <ErrorState message="Invalid ID. Please check the URL and try again." />
    );
  }

  // Fetch project metadata
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return (
      <ErrorState message="Project not found or you don't have access to it." />
    );
  }

  // Fetch env file
  const { data: envFile, error: envFileError } = await supabase
    .from("env_vars")
    .select(
      "id, project_id, user_id, name, iv, ciphertext, created_at, updated_at",
    )
    .eq("id", fileId)
    .eq("project_id", projectId)
    .single();

  if (envFileError || !envFile) {
    return (
      <ErrorState message="Environment file not found or you don't have access to it." />
    );
  }

  return (
    <EnvFileDetailsClient
      project={project as Project}
      envFile={envFile as EnvFile}
    />
  );
}
