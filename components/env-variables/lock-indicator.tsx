"use client";

import { Lock, LockOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LockIndicatorProps = {
  isUnlocked: boolean;
};

export function LockIndicator({ isUnlocked }: LockIndicatorProps) {
  if (isUnlocked) {
    return (
      <Alert className="mb-4 border-green-500/50 bg-green-500/10">
        <LockOpen className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Secrets Unlocked</AlertTitle>
        <AlertDescription className="text-green-600/80">
          Your secrets are decrypted and visible. You can add, view, and copy
          environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <Lock className="h-4 w-4" />
      <AlertTitle>Secrets Locked</AlertTitle>
      <AlertDescription>
        Viewing encrypted values only. Unlock your secrets to add or view
        decrypted environment variables.
      </AlertDescription>
    </Alert>
  );
}
