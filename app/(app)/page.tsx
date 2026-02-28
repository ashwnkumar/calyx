import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjectListingClient } from "@/components/projects/project-listing-client";
import { ErrorState } from "@/components/projects/error-state";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your encrypted environment variable projects securely with zero-knowledge encryption.",
};

export default async function DashboardPage() {
  noStore();
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, user_id, name, description, created_at, updated_at, env_vars(count)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return <ProjectListingClient initialProjects={projects ?? []} />;
}
