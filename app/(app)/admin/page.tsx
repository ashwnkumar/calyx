import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageTransition } from "@/components/page-transition";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const metadata: Metadata = {
  title: "Admin",
  description: "Super admin dashboard — user overview.",
};

export default async function AdminPage() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/dashboard");

  const adminSupabase = createAdminClient();

  // Fetch all data in parallel
  const [usersRes, projectsRes, profilesRes, envVarsRes] = await Promise.all([
    adminSupabase.auth.admin.listUsers({ perPage: 100 }),
    adminSupabase
      .from("projects")
      .select("id, user_id, name, description, created_at, env_vars(count)")
      .order("created_at", { ascending: false }),
    adminSupabase.from("profiles").select("id, test_ciphertext, created_at"),
    adminSupabase
      .from("env_vars")
      .select("id, project_id, user_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const users = usersRes.data?.users ?? [];
  const usersError = usersRes.error;
  const allProjects = projectsRes.data ?? [];
  const allProfiles = profilesRes.data ?? [];
  const allEnvVars = envVarsRes.data ?? [];

  const totalProjects = allProjects.length;
  const totalEnvVars = allEnvVars.length;

  // Build a profile lookup for passphrase status
  const profileMap = new Map(
    allProfiles.map((p) => [p.id, !!p.test_ciphertext]),
  );

  // Build per-user env var counts
  const envVarsByUser = new Map<string, number>();
  for (const ev of allEnvVars) {
    envVarsByUser.set(ev.user_id, (envVarsByUser.get(ev.user_id) ?? 0) + 1);
  }

  // Map users with enriched data
  const userList = users.map((u) => {
    const userProjects = allProjects.filter((p) => p.user_id === u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
      emailConfirmed: !!u.email_confirmed_at,
      projectCount: userProjects.length,
      envVarCount: envVarsByUser.get(u.id) ?? 0,
      passphraseSetup: profileMap.get(u.id) ?? false,
    };
  });

  // Recent projects (last 25 — has its own tab now)
  const recentProjects = allProjects.slice(0, 25).map((p) => {
    const ownerEmail =
      users.find((u) => u.id === p.user_id)?.email ?? "Unknown";
    const envCount =
      Array.isArray(p.env_vars) && p.env_vars[0]
        ? (p.env_vars[0] as { count: number }).count
        : 0;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      ownerEmail,
      createdAt: p.created_at,
      envVarCount: envCount,
    };
  });

  // Derived stats
  const usersWithPassphrase = userList.filter((u) => u.passphraseSetup).length;
  const usersWithNoProjects = userList.filter(
    (u) => u.projectCount === 0,
  ).length;
  const avgProjectsPerUser =
    users.length > 0 ? totalProjects / users.length : 0;
  const avgEnvVarsPerProject =
    totalProjects > 0 ? totalEnvVars / totalProjects : 0;

  // Active in last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeLastWeek = users.filter(
    (u) =>
      u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() > sevenDaysAgo,
  ).length;

  return (
    <PageTransition>
      <AdminDashboardClient
        stats={{
          totalUsers: users.length,
          totalProjects,
          totalEnvVars,
          usersWithPassphrase,
          usersWithNoProjects,
          avgProjectsPerUser: Math.round(avgProjectsPerUser * 10) / 10,
          avgEnvVarsPerProject: Math.round(avgEnvVarsPerProject * 10) / 10,
          activeLastWeek,
        }}
        users={userList}
        recentProjects={recentProjects}
        error={usersError?.message}
      />
    </PageTransition>
  );
}
