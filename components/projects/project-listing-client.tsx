"use client";

import { useState } from "react";
import { ProjectGrid } from "./project-grid";
import { EmptyState } from "./empty-state";
import { AddProjectDialog } from "./add-project-dialog";
import { ProjectGridSkeleton } from "./project-grid-skeleton";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectListingClientProps = {
  initialProjects: Project[];
};

export function ProjectListingClient({
  initialProjects,
}: ProjectListingClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    // Add new project to state optimistically
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your environment variables securely across projects
          </p>
        </div>
        <Button onClick={openDialog}>Add Project</Button>
      </div>

      {/* Project Grid or Empty State */}
      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
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
