"use client";

import { useState } from "react";
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
import { useSecrets } from "@/lib/contexts/SecretContext";

export interface UnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnlockDialog({ open, onOpenChange }: UnlockDialogProps) {
  const { unlock } = useSecrets();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await unlock(passphrase);
      // Success - dialog will close via onOpenChange
      onOpenChange(false);
      setPassphrase("");
    } catch (err: any) {
      // Display error and keep dialog open for retry
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPassphrase("");
    setError(null);
    onOpenChange(false);
  };

  const handlePassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock Secrets</DialogTitle>
          <DialogDescription>
            Enter your master passphrase to decrypt and view your environment
            variables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Master Passphrase</Label>
              <PasswordInput
                id="passphrase"
                value={passphrase}
                onChange={handlePassphraseChange}
                placeholder="Enter your passphrase"
                autoFocus
                disabled={isSubmitting}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "passphrase-error" : undefined}
              />
              {error && (
                <p
                  id="passphrase-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !passphrase}>
              {isSubmitting ? "Unlocking..." : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
