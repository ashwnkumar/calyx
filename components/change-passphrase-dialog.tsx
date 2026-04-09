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
import { Loader2 } from "lucide-react";
import {
  validatePassphrase,
  validateConfirmPassphrase,
} from "@/lib/passphrase-validation";

export function ChangePassphraseDialog() {
  const { changePassphrase } = useSecrets();
  const [open, setOpen] = useState(false);
  const [currentPassphrase, setCurrentPassphrase] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!currentPassphrase) {
      next.current = "Current passphrase is required";
    }

    const newErr = validatePassphrase(newPassphrase);
    if (newErr) next.new = newErr;

    const confirmErr = validateConfirmPassphrase(
      newPassphrase,
      confirmPassphrase,
    );
    if (confirmErr) next.confirm = confirmErr;

    if (
      newPassphrase &&
      currentPassphrase &&
      newPassphrase === currentPassphrase
    ) {
      next.new = "New passphrase must be different from current";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await changePassphrase(currentPassphrase, newPassphrase);
      handleClose();
    } catch {
      // Error already toasted by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPassphrase("");
    setNewPassphrase("");
    setConfirmPassphrase("");
    setErrors({});
    setIsSubmitting(false);
  };

  const isDisabled =
    isSubmitting || !currentPassphrase || !newPassphrase || !confirmPassphrase;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Change Passphrase
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
      >
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
                <Label htmlFor="current-passphrase">Current Passphrase</Label>
                <PasswordInput
                  id="current-passphrase"
                  value={currentPassphrase}
                  onChange={(e) => {
                    setCurrentPassphrase(e.target.value);
                    if (errors.current)
                      setErrors((p) => ({ ...p, current: "" }));
                  }}
                  autoComplete="off"
                  autoFocus
                  disabled={isSubmitting}
                  aria-invalid={!!errors.current}
                  aria-describedby={
                    errors.current ? "current-error" : undefined
                  }
                />
                {errors.current && (
                  <p id="current-error" className="text-sm text-destructive">
                    {errors.current}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-passphrase">New Passphrase</Label>
                <PasswordInput
                  id="new-passphrase"
                  value={newPassphrase}
                  onChange={(e) => {
                    setNewPassphrase(e.target.value);
                    if (errors.new) setErrors((p) => ({ ...p, new: "" }));
                  }}
                  autoComplete="off"
                  placeholder="At least 12 characters"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.new}
                  aria-describedby={errors.new ? "new-error" : undefined}
                />
                {errors.new && (
                  <p id="new-error" className="text-sm text-destructive">
                    {errors.new}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-new-passphrase">
                  Confirm New Passphrase
                </Label>
                <PasswordInput
                  id="confirm-new-passphrase"
                  value={confirmPassphrase}
                  onChange={(e) => {
                    setConfirmPassphrase(e.target.value);
                    if (errors.confirm)
                      setErrors((p) => ({ ...p, confirm: "" }));
                  }}
                  autoComplete="off"
                  placeholder="Re-enter new passphrase"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirm}
                  aria-describedby={
                    errors.confirm ? "confirm-error" : undefined
                  }
                />
                {errors.confirm && (
                  <p id="confirm-error" className="text-sm text-destructive">
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isDisabled}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Passphrase"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
