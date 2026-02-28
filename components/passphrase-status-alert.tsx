"use client";

import { useState } from "react";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Key, Lock, LockOpen } from "lucide-react";
import { SetupDialog } from "@/components/setup-dialog";
import { UnlockDialog } from "@/components/unlock-dialog";

export function PassphraseStatusAlert() {
  const { isPassphraseSetup, isUnlocked, lock } = useSecrets();
  const [setupOpen, setSetupOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  // State 1: Setup prompt (isPassphraseSetup=false)
  if (!isPassphraseSetup) {
    return (
      <>
        <Alert className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5" />
            <AlertDescription>
              Set up your master passphrase to encrypt your secrets
            </AlertDescription>
          </div>
          <Button onClick={() => setSetupOpen(true)} size="sm">
            Set Up Passphrase
          </Button>
        </Alert>
        <SetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      </>
    );
  }

  // State 2: Locked (isPassphraseSetup=true, isUnlocked=false)
  if (!isUnlocked) {
    return (
      <>
        <Alert className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <AlertDescription>
              Your secrets are locked. Enter your passphrase to view them.
            </AlertDescription>
          </div>
          <Button onClick={() => setUnlockOpen(true)} size="sm">
            Unlock
          </Button>
        </Alert>
        <UnlockDialog open={unlockOpen} onOpenChange={setUnlockOpen} />
      </>
    );
  }

  // State 3: Unlocked (isUnlocked=true)
  return (
    <Alert className="flex items-center justify-between bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
      <div className="flex items-center gap-3">
        <LockOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-900 dark:text-green-100">
          Secrets unlocked
        </AlertDescription>
      </div>
      <Button onClick={lock} size="sm" variant="outline">
        Lock
      </Button>
    </Alert>
  );
}
