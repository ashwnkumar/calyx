"use client";

import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onAddProject: () => void;
};

export function EmptyState({ onAddProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FolderPlus className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first project to start managing environment variables
        securely
      </p>

      <Button onClick={onAddProject}>Create Project</Button>
    </div>
  );
}
