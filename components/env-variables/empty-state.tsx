"use client";

import { FileText, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onAddEnvVar: () => void;
  isUnlocked: boolean;
};

export function EmptyState({ onAddEnvVar, isUnlocked }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        {isUnlocked ? (
          <FileText className="size-7 text-primary" />
        ) : (
          <Lock className="size-7 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {isUnlocked ? "No environment files yet" : "Secrets are locked"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {isUnlocked
          ? "Add your first .env file to start managing secrets for this project. Paste your entire file content — it'll be encrypted end-to-end."
          : "Unlock your secrets from the header to add and view environment files."}
      </p>
      {isUnlocked && (
        <Button onClick={onAddEnvVar} className="gap-1.5">
          Add Environment File
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
