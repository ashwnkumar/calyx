"use client";

import { useState, useMemo } from "react";
import { ProjectGrid } from "./project-grid";
import { EmptyState } from "./empty-state";
import { AddProjectDialog } from "./add-project-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Search, Plus } from "lucide-react";

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

const sortLabelsShort: Record<SortOption, string> = {
  updated_desc: "Updated ↓",
  updated_asc: "Updated ↑",
  created_desc: "Created ↓",
  created_asc: "Created ↑",
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSorted = useMemo(() => {
    let result = [...projects];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
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

    return result;
  }, [projects, sortBy, searchQuery]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleProjectDeleted = (projectId: string) => {
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
          <p className="text-sm text-muted-foreground mt-1">
            Manage your environment variables securely across projects
          </p>
        </div>
        <Button
          id="add-project-btn"
          onClick={() => setIsDialogOpen(true)}
          className="gap-1.5 sm:w-auto w-full"
        >
          <Plus className="size-4" />
          Add Project
        </Button>
      </div>

      {/* Search + Sort bar */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0 h-9"
              >
                <ArrowUpDown className="size-3.5" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                <span className="sm:hidden">{sortLabelsShort[sortBy]}</span>
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
        </div>
      )}

      {/* Results info when searching */}
      {searchQuery && projects.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredAndSorted.length === 0
            ? "No projects match your search"
            : `Showing ${filteredAndSorted.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Project Grid or Empty State */}
      {projects.length === 0 ? (
        <EmptyState onAddProject={() => setIsDialogOpen(true)} />
      ) : filteredAndSorted.length > 0 ? (
        <ProjectGrid
          projects={filteredAndSorted}
          onProjectDeleted={handleProjectDeleted}
        />
      ) : null}

      <AddProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
