"use client";

import { ProjectCard } from "./project-card";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

type ProjectGridProps = {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
};

export function ProjectGrid({ projects, onProjectDeleted }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectDeleted={onProjectDeleted}
        />
      ))}
    </div>
  );
}
