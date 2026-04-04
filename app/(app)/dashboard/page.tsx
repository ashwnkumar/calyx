import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjectListingClient } from "@/components/projects/project-listing-client";
import { ErrorState } from "@/components/projects/error-state";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your encrypted environment variable projects securely with zero-knowledge encryption.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, user_id, name, description, created_at, updated_at, env_vars(count)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <PageTransition>
      <ProjectListingClient initialProjects={projects ?? []} />
    </PageTransition>
  );
}
