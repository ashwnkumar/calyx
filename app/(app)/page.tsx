import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ProjectListingClient } from "@/components/projects/project-listing-client";
import { ErrorState } from "@/components/projects/error-state";

export default async function DashboardPage() {
  noStore();
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, user_id, name, description, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return <ProjectListingClient initialProjects={projects ?? []} />;
}
