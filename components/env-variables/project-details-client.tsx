"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { createClient } from "@/lib/supabase/client";
import {
  updateProjectName,
  updateProjectDescription,
} from "@/app/(app)/actions";
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

  const handleAddClick = () => {
    if (!isUnlocked) {
      toast.error("Please unlock secrets first");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleEnvFileAdded = async (newFile: EnvFile) => {
    setEnvFiles((prev) => [newFile, ...prev]);
    await refetchEnvFiles();
  };

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
      if (error) throw error;
      setEnvFiles(data || []);
    } catch (error) {
      console.error("Failed to refetch env files:", error);
      toast.warning("Failed to refresh data. Showing cached results.");
    }
  };

  const handleEnvFileDeleted = async (fileId: string) => {
    setEnvFiles((prev) => prev.filter((f) => f.id !== fileId));
    await refetchEnvFiles();
  };

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
      if (!result.success) throw new Error(result.error);
      toast.success("Project name updated");
      setIsEditingName(false);
      project.name = result.data.name;
    } catch (error: any) {
      toast.error(error.message || "Failed to update project name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSaveName();
    else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditedName(project.name);
    }
  };

  const handleSaveDescription = async () => {
    const trimmed = editedDescription.trim();
    if (trimmed === (project.description || "")) {
      setIsEditingDescription(false);
      return;
    }
    setIsSavingDescription(true);
    try {
      const result = await updateProjectDescription(
        project.id,
        trimmed || null,
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Description updated");
      setIsEditingDescription(false);
      project.description = result.data.description;
    } catch (error: any) {
      toast.error(error.message || "Failed to update description");
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      setIsEditingDescription(false);
      setEditedDescription(project.description || "");
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSaveDescription();
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {project.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          {/* Name */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                disabled={isSavingName}
                className="text-2xl font-bold h-auto py-1 px-2"
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
                <Check className="size-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditingName(false);
                  setEditedName(project.name);
                }}
                disabled={isSavingName}
                aria-label="Cancel edit"
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                {project.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingName(true)}
                className="size-7 opacity-0 group-hover:opacity-100"
                aria-label="Edit project name"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Description */}
          {isEditingDescription ? (
            <div className="flex items-start gap-2 mt-2">
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                disabled={isSavingDescription}
                className="text-sm resize-none"
                placeholder="Add a description..."
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
                  <Check className="size-3.5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditingDescription(false);
                    setEditedDescription(project.description || "");
                  }}
                  disabled={isSavingDescription}
                  aria-label="Cancel edit"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1 group">
              <p className="text-sm text-muted-foreground">
                {project.description || (
                  <span className="italic">No description</span>
                )}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingDescription(true)}
                className="size-6 opacity-0 group-hover:opacity-100"
                aria-label="Edit description"
              >
                <Pencil className="size-3" />
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleAddClick}
          disabled={!isUnlocked}
          className="gap-1.5 w-full sm:w-auto shrink-0"
        >
          <Plus className="size-4" />
          Add Environment File
        </Button>
      </div>

      {/* Add Dialog */}
      <AddEnvDialog
        projectId={project.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEnvFileAdded={handleEnvFileAdded}
      />

      {/* Env Files Grid or Empty State */}
      {envFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
