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
import { encrypt } from "@/lib/crypto";
import { addEnvFile } from "@/app/(app)/projects/[id]/actions";

type EnvFile = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

type AddEnvDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnvFileAdded: (envFile: EnvFile) => void;
};

/**
 * AddEnvDialog Component
 *
 * Dialog component for adding encrypted environment file to a project.
 * Stores entire .env file content as encrypted blob.
 *
 * Features:
 * - Name input for env file (e.g., 'production', 'development')
 * - Textarea for entire .env file content
 * - Encrypts entire content client-side using SecretContext cryptoKey
 * - Calls addEnvFile Server Action
 * - Handles success/error states with toast notifications
 */
export function AddEnvDialog({
  projectId,
  open,
  onOpenChange,
  onEnvFileAdded,
}: AddEnvDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
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
      // Check unlock state
      if (!cryptoKey || !isUnlocked) {
        throw new Error("Secrets are locked. Please unlock first.");
      }

      // Validate inputs
      if (!formData.name.trim()) {
        throw new Error("Environment file name is required");
      }

      if (!formData.content.trim()) {
        throw new Error("Environment file content is required");
      }

      // Encrypt entire content
      const { iv, ciphertext } = await encrypt(formData.content, cryptoKey);

      // Call Server Action
      const result = await addEnvFile(projectId, {
        name: formData.name.trim(),
        iv,
        ciphertext,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Success handling
      toast.success(`Added environment file: ${formData.name}`);
      onEnvFileAdded(result.data);
      onOpenChange(false);

      // Reset form
      setFormData({ name: "", content: "" });
    } catch (err) {
      // Error handling
      console.error("Failed to add env file:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add environment file",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Close dialog and discard data
    onOpenChange(false);
    setFormData({ name: "", content: "" });
    setError(null);
  };

  // Check if submit should be disabled
  const isSubmitDisabled =
    isSubmitting || !formData.name.trim() || !formData.content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Environment File</DialogTitle>
          <DialogDescription>
            Give your environment file a name (e.g., production, development,
            frontend) and paste the entire .env file content below. Everything
            will be encrypted and stored securely, including comments and
            formatting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Environment Name</Label>
              <Input
                id="name"
                placeholder="e.g., production, development, frontend"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSubmitting}
                className="font-mono"
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <Label htmlFor="content">Environment File Content</Label>
              <Textarea
                id="content"
                placeholder="DATABASE_URL=postgresql://localhost:5432/db&#10;API_KEY=your-secret-key&#10;# Production settings&#10;# REDIS_URL=redis://localhost:6379"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                disabled={isSubmitting}
                rows={15}
                className="font-mono text-sm resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 shrink-0 border-t mt-4">
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
