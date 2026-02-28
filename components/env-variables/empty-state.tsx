"use client";

import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onAddEnvVar: () => void;
  isUnlocked: boolean;
};

export function EmptyState({ onAddEnvVar, isUnlocked }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Key className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No environment variables yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {isUnlocked
          ? "Add your first environment variable to start managing secrets securely"
          : "Unlock your secrets to add environment variables"}
      </p>
      <Button onClick={onAddEnvVar} disabled={!isUnlocked}>
        Add Environment Variable
      </Button>
    </div>
  );
}
