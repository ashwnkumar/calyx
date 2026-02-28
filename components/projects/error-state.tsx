"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="flex flex-col items-center gap-2 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-semibold">Failed to load projects</h2>
        <p className="text-muted-foreground">
          {message || "An error occurred while fetching your projects."}
        </p>
        <Button onClick={handleRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
}
