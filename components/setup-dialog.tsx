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
import { Alert } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import {
  validatePassphrase,
  validateConfirmPassphrase,
} from "@/lib/passphrase-validation";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { Loader2 } from "lucide-react";

type SetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormErrors = {
  passphrase?: string;
  confirmPassphrase?: string;
};

export function SetupDialog({ open, onOpenChange }: SetupDialogProps) {
  const { unlock } = useSecrets();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePassphraseBlur = () => {
    const error = validatePassphrase(passphrase);
    setErrors((prev) => ({ ...prev, passphrase: error || undefined }));
  };

  const handleConfirmPassphraseBlur = () => {
    const error = validateConfirmPassphrase(passphrase, confirmPassphrase);
    setErrors((prev) => ({
      ...prev,
      confirmPassphrase: error || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields before submission
    const passphraseError = validatePassphrase(passphrase);
    const confirmError = validateConfirmPassphrase(
      passphrase,
      confirmPassphrase,
    );

    if (passphraseError || confirmError) {
      setErrors({
        passphrase: passphraseError || undefined,
        confirmPassphrase: confirmError || undefined,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await unlock(passphrase);
      // Success - close dialog and clear form
      handleClose();
    } catch (err) {
      // Error is already toasted by SecretContext, but we keep dialog open
      setSubmitError(
        err instanceof Error ? err.message : "Failed to set up passphrase",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear form state on close
    setPassphrase("");
    setConfirmPassphrase("");
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    handleClose();
  };

  const hasErrors = !!(errors.passphrase || errors.confirmPassphrase);
  const isSubmitDisabled =
    hasErrors || isSubmitting || !passphrase || !confirmPassphrase;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Up Master Passphrase</DialogTitle>
            <DialogDescription>
              Create a strong passphrase to encrypt all your secrets
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Security Warning Section */}
            <Alert
              variant="default"
              className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <div className="ml-2 space-y-2 text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Important Security Information
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
                  <li>Your passphrase encrypts all secrets</li>
                  <li>
                    Forgotten passphrases result in permanent data loss with no
                    recovery possible
                  </li>
                  <li>Your passphrase never leaves your browser</li>
                </ul>
              </div>
            </Alert>

            {/* Submit Error Display */}
            {submitError && (
              <Alert variant="destructive">
                <p className="text-sm">{submitError}</p>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase">Master Passphrase</Label>
                <PasswordInput
                  id="passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  onBlur={handlePassphraseBlur}
                  placeholder="Enter a strong passphrase (min 12 characters)"
                  disabled={isSubmitting}
                  aria-describedby={
                    errors.passphrase ? "passphrase-error" : undefined
                  }
                />
                {errors.passphrase && (
                  <p
                    id="passphrase-error"
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.passphrase}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassphrase">Confirm Passphrase</Label>
                <PasswordInput
                  id="confirmPassphrase"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  onBlur={handleConfirmPassphraseBlur}
                  placeholder="Re-enter your passphrase"
                  disabled={isSubmitting}
                  aria-describedby={
                    errors.confirmPassphrase
                      ? "confirm-passphrase-error"
                      : undefined
                  }
                />
                {errors.confirmPassphrase && (
                  <p
                    id="confirm-passphrase-error"
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.confirmPassphrase}
                  </p>
                )}
              </div>
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
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Set Up Passphrase"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
