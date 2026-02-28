"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { createClient } from "@/lib/supabase/client";
import {
  updateProjectName,
  updateProjectDescription,
} from "@/app/(app)/actions";
import { LockIndicator } from "./lock-indicator";
import { AddEnvDialog } from "./add-env-dialog";
import { EnvFileCard } from "./env-file-card";
import { EmptyState } from "./empty-state";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

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

type ProjectDetailsClientProps = {
  project: Project;
  initialEnvFiles: EnvFile[];
};

/**
 * ProjectDetailsClient Component
 *
 * Main client component for project details page.
 * Displays environment files as cards.
 *
 * Features:
 * - Lock state management via SecretContext
 * - Add env file dialog
 * - Grid of env file cards
 * - Project name editing
 * - Empty state when no files
 */
export function ProjectDetailsClient({
  project,
  initialEnvFiles,
}: ProjectDetailsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [envFiles, setEnvFiles] = useState<EnvFile[]>(initialEnvFiles);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    project.description || "",
  );
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const { isUnlocked } = useSecrets();

  /**
   * Handle Add button click
   */
  const handleAddClick = () => {
    if (!isUnlocked) {
      toast.error("Please unlock secrets first");
      return;
    }
    setIsDialogOpen(true);
  };

  /**
   * Handle successful env file addition
   */
  const handleEnvFileAdded = async (newFile: EnvFile) => {
    // Optimistic update
    setEnvFiles((prev) => [newFile, ...prev]);

    // Refetch to ensure consistency
    await refetchEnvFiles();
  };

  /**
   * Refetch env files from Supabase
   */
  const refetchEnvFiles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("env_vars")
        .select(
          "id, project_id, user_id, name, iv, ciphertext, created_at, updated_at",
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setEnvFiles(data || []);
    } catch (error) {
      console.error("Failed to refetch env files:", error);
      toast.warning("Failed to refresh data. Showing cached results.");
    }
  };

  /**
   * Handle env file deletion
   */
  const handleEnvFileDeleted = async (fileId: string) => {
    // Optimistic update
    setEnvFiles((prev) => prev.filter((f) => f.id !== fileId));

    // Refetch to ensure consistency
    await refetchEnvFiles();
  };

  /**
   * Handle edit name button click
   */
  const handleEditNameClick = () => {
    setIsEditingName(true);
    setEditedName(project.name);
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(project.name);
  };

  /**
   * Handle save edited name
   */
  const handleSaveName = async () => {
    const trimmedName = editedName.trim();

    if (!trimmedName) {
      toast.error("Project name cannot be empty");
      return;
    }

    if (trimmedName === project.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);

    try {
      const result = await updateProjectName(project.id, trimmedName);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Project name updated successfully");
      setIsEditingName(false);
      project.name = result.data.name;
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update project name");
    } finally {
      setIsSavingName(false);
    }
  };

  /**
   * Handle Enter key in name input
   */
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  /**
   * Handle edit description button click
   */
  const handleEditDescriptionClick = () => {
    setIsEditingDescription(true);
    setEditedDescription(project.description || "");
  };

  /**
   * Handle cancel description edit
   */
  const handleCancelDescriptionEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription(project.description || "");
  };

  /**
   * Handle save edited description
   */
  const handleSaveDescription = async () => {
    const trimmedDescription = editedDescription.trim();

    // Allow empty description (null)
    if (trimmedDescription === (project.description || "")) {
      setIsEditingDescription(false);
      return;
    }

    setIsSavingDescription(true);

    try {
      const result = await updateProjectDescription(
        project.id,
        trimmedDescription || null,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Project description updated successfully");
      setIsEditingDescription(false);
      project.description = result.data.description;
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update project description");
    } finally {
      setIsSavingDescription(false);
    }
  };

  /**
   * Handle keyboard shortcuts in description textarea
   */
  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      handleCancelDescriptionEdit();
    }
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSaveDescription();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            aria-label="Back to projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  disabled={isSavingName}
                  className="text-3xl font-bold h-auto py-1 px-2"
                  maxLength={100}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  aria-label="Save name"
                >
                  <Check className="h-5 w-5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  disabled={isSavingName}
                  aria-label="Cancel edit"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditNameClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Edit project name"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isEditingDescription ? (
              <div className="flex items-start gap-2 mt-2">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  onKeyDown={handleDescriptionKeyDown}
                  disabled={isSavingDescription}
                  className="text-sm resize-none"
                  placeholder="Add a description for this project..."
                  rows={2}
                  maxLength={500}
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveDescription}
                    disabled={isSavingDescription}
                    aria-label="Save description"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelDescriptionEdit}
                    disabled={isSavingDescription}
                    aria-label="Cancel edit"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 mt-1 group">
                {project.description ? (
                  <p className="text-muted-foreground">{project.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description</p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditDescriptionClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  aria-label="Edit project description"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={handleAddClick}
            disabled={!isUnlocked}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Environment File
          </Button>
        </div>
      </div>

      {/* Lock Indicator */}
      <LockIndicator isUnlocked={isUnlocked} />

      {/* Add Environment File Dialog */}
      <AddEnvDialog
        projectId={project.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEnvFileAdded={handleEnvFileAdded}
      />

      {/* Environment Files Grid or Empty State */}
      {envFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {envFiles.map((file) => (
            <EnvFileCard
              key={file.id}
              envFile={file}
              projectId={project.id}
              onDeleted={handleEnvFileDeleted}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddEnvVar={handleAddClick} isUnlocked={isUnlocked} />
      )}
    </div>
  );
}
