"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProject } from "@/app/(app)/actions";
import { validateProjectData } from "@/lib/validations/project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type AddProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
};

export function AddProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: AddProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validation = validateProjectData(formData);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Create FormData for Server Action
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name.trim());
    formDataObj.append("description", formData.description);

    startTransition(async () => {
      try {
        const result = await createProject(formDataObj);

        if (result.success) {
          // Success - close dialog and notify parent
          toast.success("Project created successfully");
          onProjectCreated(result.data);
          onOpenChange(false);

          // Reset form
          setFormData({ name: "", description: "" });
          setError(null);
        } else {
          // Server-side error
          setError(result.error);
          toast.error(result.error);
        }
      } catch (err) {
        console.error("Project creation error:", err);
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form and error when canceling
    setFormData({ name: "", description: "" });
    setError(null);
  };

  const isSubmitDisabled = isPending || !formData.name.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Create a new project to manage environment variables securely.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="My Project"
              required
              maxLength={100}
              disabled={isPending}
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Optional description for your project"
              maxLength={500}
              disabled={isPending}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
