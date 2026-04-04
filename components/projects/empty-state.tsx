"use client";

import { FolderPlus, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onAddProject: () => void;
};

export function EmptyState({ onAddProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-5 mb-5">
        <FolderPlus className="size-8 text-primary" />
      </div>

      <h2 className="text-xl font-semibold mb-2">No projects yet</h2>

      <p className="text-sm text-muted-foreground mb-2 max-w-sm">
        Projects help you organize your environment variables. Create one for
        each app or service you work on.
      </p>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Shield className="size-3" />
        <span>Everything is encrypted end-to-end</span>
      </div>

      <Button onClick={onAddProject} className="gap-1.5">
        Create your first project
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
