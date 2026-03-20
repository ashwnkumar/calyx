"use client";

import { useState, useMemo } from "react";
import { ProjectGrid } from "./project-grid";
import { EmptyState } from "./empty-state";
import { AddProjectDialog } from "./add-project-dialog";
import { ProjectGridSkeleton } from "./project-grid-skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";

type SortOption =
  | "updated_desc"
  | "updated_asc"
  | "created_desc"
  | "created_asc";

const sortLabels: Record<SortOption, string> = {
  updated_desc: "Last Updated (Newest)",
  updated_asc: "Last Updated (Oldest)",
  created_desc: "Created (Newest)",
  created_asc: "Created (Oldest)",
};

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

type ProjectListingClientProps = {
  initialProjects: Project[];
};

export function ProjectListingClient({
  initialProjects,
}: ProjectListingClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [sortBy, setSortBy] = useState<SortOption>("updated_desc");

  const sortedProjects = useMemo(() => {
    const sorted = [...projects];
    sorted.sort((a, b) => {
      const [field, direction] = sortBy.split("_") as [
        "updated" | "created",
        "asc" | "desc",
      ];
      const dateA = new Date(
        field === "updated" ? a.updated_at : a.created_at,
      ).getTime();
      const dateB = new Date(
        field === "updated" ? b.updated_at : b.created_at,
      ).getTime();
      return direction === "desc" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [projects, sortBy]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    // Add new project to state optimistically
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleProjectDeleted = (projectId: string) => {
    // Remove deleted project from state
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Projects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your environment variables securely across projects
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                <span className="sm:hidden">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {sortLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openDialog} className="flex-1 sm:flex-initial">
            Add Project
          </Button>
        </div>
      </div>

      {/* Project Grid or Empty State */}
      {sortedProjects.length > 0 ? (
        <ProjectGrid
          projects={sortedProjects}
          onProjectDeleted={handleProjectDeleted}
        />
      ) : (
        <EmptyState onAddProject={openDialog} />
      )}

      {/* Add Project Dialog */}
      <AddProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
