"use client";

import { useState } from "react";
import { useSecrets } from "@/lib/contexts/SecretContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export function ChangePassphraseDialog() {
  const { changePassphrase, isUnlocked } = useSecrets();
  const [open, setOpen] = useState(false);
  const [lockedAlertOpen, setLockedAlertOpen] = useState(false);
  const [oldPassphrase, setOldPassphrase] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassphrase !== confirmPassphrase) {
      toast.error("New passphrases do not match");
      return;
    }

    if (newPassphrase.length < 8) {
      toast.error("New passphrase must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassphrase(oldPassphrase, newPassphrase);
      setOpen(false);
      setOldPassphrase("");
      setNewPassphrase("");
      setConfirmPassphrase("");
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => (isUnlocked ? setOpen(true) : setLockedAlertOpen(true))}
      >
        Change Passphrase
      </Button>

      <AlertDialog open={lockedAlertOpen} onOpenChange={setLockedAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>App is Locked</AlertDialogTitle>
            <AlertDialogDescription>
              Please unlock the app using your master password to access this
              feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setLockedAlertOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Change Master Passphrase</DialogTitle>
              <DialogDescription>
                Update your master passphrase. All encrypted data will be
                re-encrypted with the new passphrase.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="old-passphrase">Current Passphrase</Label>
                <PasswordInput
                  id="old-passphrase"
                  value={oldPassphrase}
                  onChange={(e) => setOldPassphrase(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-passphrase">New Passphrase</Label>
                <PasswordInput
                  id="new-passphrase"
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-passphrase">
                  Confirm New Passphrase
                </Label>
                <PasswordInput
                  id="confirm-passphrase"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Changing..." : "Change Passphrase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
