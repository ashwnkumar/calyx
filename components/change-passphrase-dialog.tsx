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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export function ChangePassphraseDialog() {
  const { changePassphrase, isUnlocked } = useSecrets();
  const [open, setOpen] = useState(false);
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
      resetForm();
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setOldPassphrase("");
    setNewPassphrase("");
    setConfirmPassphrase("");
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  return (
    <>
      {!isUnlocked ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="pointer-events-none"
                >
                  Change Passphrase
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Unlock your secrets first to change passphrase</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Change Passphrase
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Change Master Passphrase</DialogTitle>
              <DialogDescription>
                All encrypted data will be re-encrypted with the new passphrase.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="old-passphrase">Current Passphrase</Label>
                <PasswordInput
                  id="old-passphrase"
                  value={oldPassphrase}
                  onChange={(e) => setOldPassphrase(e.target.value)}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-passphrase">New Passphrase</Label>
                <PasswordInput
                  id="new-passphrase"
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  autoComplete="off"
                  placeholder="At least 8 characters"
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
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !oldPassphrase ||
                  !newPassphrase ||
                  !confirmPassphrase
                }
              >
                {isSubmitting ? "Changing..." : "Change Passphrase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
