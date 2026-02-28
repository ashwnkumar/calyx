"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { parseEnvContent } from "@/lib/parsers/env-parser";
import { validateEnvFormData } from "@/lib/validations/env-variable";
import { encrypt } from "@/lib/crypto";
import { addEnvVariables } from "@/app/(app)/projects/[id]/actions";

type EnvVariable = {
  id: string;
  project_id: string;
  user_id: string;
  key: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

type AddEnvDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnvVarsAdded: (vars: EnvVariable[]) => void;
};

/**
 * AddEnvDialog Component
 *
 * Dialog component for adding encrypted environment variables to a project.
 * Integrates parsing, validation, encryption, and Server Action submission.
 *
 * Features:
 * - Parses .env formatted content (KEY=value)
 * - Validates content field
 * - Encrypts values client-side using SecretContext cryptoKey
 * - Calls addEnvVariables Server Action
 * - Handles success/error states with toast notifications
 *
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 3.4, 3.5, 3.6, 3.7,
 *               4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.3, 5.4
 */
export function AddEnvDialog({
  projectId,
  open,
  onOpenChange,
  onEnvVarsAdded,
}: AddEnvDialogProps) {
  const [formData, setFormData] = useState({
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cryptoKey, isUnlocked } = useSecrets();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check unlock state (Requirement 4.2)
      if (!cryptoKey || !isUnlocked) {
        throw new Error("Secrets are locked. Please unlock first.");
      }

      // Validate form data (Requirement 3.7)
      const validation = validateEnvFormData(formData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Parse .env content (Requirement 4.3, 8.1-8.5)
      const parsedVars = parseEnvContent(formData.content);
      if (parsedVars.length === 0) {
        throw new Error("No valid environment variables found");
      }

      // Encrypt each variable (Requirements 4.4, 4.5, 4.6)
      const encryptedVars = await Promise.all(
        parsedVars.map(async ({ key, value }) => {
          const { iv, ciphertext } = await encrypt(value, cryptoKey);
          return {
            key,
            iv,
            ciphertext,
          };
        }),
      );

      // Call Server Action (Requirement 5.1, 5.2)
      const result = await addEnvVariables(projectId, encryptedVars);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Success handling (Requirement 5.3)
      toast.success(`Added ${result.data.length} environment variable(s)`);
      onEnvVarsAdded(result.data);
      onOpenChange(false);

      // Reset form (Requirement 2.4)
      setFormData({ content: "" });
    } catch (err) {
      // Error handling (Requirements 4.7, 5.4)
      console.error("Failed to add env vars:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add environment variables",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Close dialog and discard data (Requirement 2.4)
    onOpenChange(false);
    setFormData({ content: "" });
    setError(null);
  };

  // Check if submit should be disabled (Requirement 3.7)
  const isSubmitDisabled = isSubmitting || !formData.content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Environment Variables</DialogTitle>
          <DialogDescription>
            Paste your .env file content below. Each line should be in KEY=value
            format. Comments (lines starting with #) and empty lines will be
            skipped.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Textarea (Requirements 3.2, 3.4) */}
          <div className="space-y-2">
            <Label htmlFor="content">Environment Variables</Label>
            <Textarea
              id="content"
              placeholder="DATABASE_URL=postgresql://localhost:5432/db&#10;API_KEY=your-secret-key&#10;# Comments are ignored"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              disabled={isSubmitting}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Action Buttons (Requirements 3.5, 3.6) */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
