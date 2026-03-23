import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: projectId } = await params;

  if (!isValidUUID(projectId)) {
    return {
      title: "Invalid Project",
      description: "The requested project could not be found.",
    };
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, description")
    .eq("id", projectId)
    .single();

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: project.name,
    description:
      project.description ||
      `View and manage encrypted environment variables for ${project.name}`,
  };
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  if (!isValidUUID(projectId)) {
    return (
      <ErrorState message="Invalid project ID. Please check the URL and try again." />
    );
  }

  const supabase = await createClient();

  // Fetch project and env_vars in parallel
  const [projectResult, envResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at")
      .eq("id", projectId)
      .single(),
    supabase
      .from("env_vars")
      .select(
        "id, project_id, user_id, name, iv, ciphertext, created_at, updated_at",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <ErrorState message="Project not found or you don't have access to it." />
    );
  }

  if (envResult.error) {
    console.error("Failed to fetch env files:", envResult.error);
  }

  return (
    <ProjectDetailsClient
      project={projectResult.data as Project}
      initialEnvFiles={(envResult.data as EnvFile[]) ?? []}
    />
  );
}
