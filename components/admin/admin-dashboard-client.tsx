"use client";

import {
  Users,
  FolderKanban,
  KeyRound,
  Clock,
  ShieldCheck,
  UserX,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Types ─── */

type UserRow = {
  id: string;
  email: string;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  projectCount: number;
  envVarCount: number;
  passphraseSetup: boolean;
};

type RecentProject = {
  id: string;
  name: string;
  description: string | null;
  ownerEmail: string;
  createdAt: string;
  envVarCount: number;
};

type Stats = {
  totalUsers: number;
  totalProjects: number;
  totalEnvVars: number;
  usersWithPassphrase: number;
  usersWithNoProjects: number;
  avgProjectsPerUser: number;
  avgEnvVarsPerProject: number;
  activeLastWeek: number;
};

type Props = {
  stats: Stats;
  users: UserRow[];
  recentProjects: RecentProject[];
  error?: string;
};

/* ─── Helpers ─── */

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">
          {label}
        </CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Tab: Overview ─── */

function OverviewTab({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeLastWeek} active this week`}
          icon={Users}
        />
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          subtitle={`~${stats.avgProjectsPerUser} per user`}
          icon={FolderKanban}
        />
        <StatCard
          label="Env Variables"
          value={stats.totalEnvVars}
          subtitle={`~${stats.avgEnvVarsPerProject} per project`}
          icon={KeyRound}
        />
        <StatCard
          label="Encryption Setup"
          value={stats.usersWithPassphrase}
          subtitle={`of ${stats.totalUsers} users`}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active (7d)"
          value={stats.activeLastWeek}
          icon={Activity}
        />
        <StatCard
          label="No Projects Yet"
          value={stats.usersWithNoProjects}
          icon={UserX}
        />
        <StatCard
          label="Avg Vars / Project"
          value={stats.avgEnvVarsPerProject}
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}

/* ─── Tab: Users ─── */

function UsersTab({ users }: { users: UserRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Users</CardTitle>
        <CardDescription>
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Vars</TableHead>
                  <TableHead className="text-center">Encryption</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Sign In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          {u.emailConfirmed ? (
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <XCircle className="size-4 text-amber-500 mx-auto" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {u.emailConfirmed
                            ? "Email confirmed"
                            : "Email not confirmed"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="tabular-nums">
                        {u.projectCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="tabular-nums">
                        {u.envVarCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          {u.passphraseSetup ? (
                            <Lock className="size-4 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <Unlock className="size-4 text-muted-foreground mx-auto" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {u.passphraseSetup
                            ? "Passphrase configured"
                            : "No passphrase set"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {formatRelative(u.lastSignIn)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Tab: Projects ─── */

function ProjectsTab({ recentProjects }: { recentProjects: RecentProject[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Projects</CardTitle>
        <CardDescription>
          {recentProjects.length} most recent projects across all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No projects found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-center">Vars</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {p.ownerEmail}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="tabular-nums">
                        {p.envVarCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelative(p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Main Component ─── */

export function AdminDashboardClient({
  stats,
  users,
  recentProjects,
  error,
}: Props) {
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load admin data: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all users and platform activity.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">
              Users
              <Badge
                variant="secondary"
                className="ml-1.5 tabular-nums text-[10px] px-1.5 py-0"
              >
                {stats.totalUsers}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="projects">
              Projects
              <Badge
                variant="secondary"
                className="ml-1.5 tabular-nums text-[10px] px-1.5 py-0"
              >
                {stats.totalProjects}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab stats={stats} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab recentProjects={recentProjects} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
