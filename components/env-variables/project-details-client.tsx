"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { createClient } from "@/lib/supabase/client";
import { deleteEnvVariables } from "@/app/(app)/projects/[id]/actions";
import { LockIndicator } from "./lock-indicator";
import { AddEnvDialog } from "./add-env-dialog";
import { EnvVariableTable } from "./env-variable-table";
import { EmptyState } from "./empty-state";
import { DownloadControls } from "./download-controls";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

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

type ProjectDetailsClientProps = {
  project: Project;
  initialEnvVars: EnvVariable[];
};

/**
 * ProjectDetailsClient Component
 *
 * Main client component that orchestrates the project details page UI.
 * Integrates LockIndicator, AddEnvDialog, EnvVariableGrid, and EmptyState.
 *
 * Features:
 * - Consumes SecretContext for lock state management
 * - Manages dialog open/close state
 * - Manages env_vars state with optimistic updates
 * - Handles data refresh after mutations
 * - Enforces lock state for Add button
 *
 * Requirements: 1.2, 2.1, 4.1, 4.2, 7.1, 7.2, 7.3, 7.4, 10.1, 10.2, 10.3
 */
export function ProjectDetailsClient({
  project,
  initialEnvVars,
}: ProjectDetailsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVariable[]>(initialEnvVars);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { isUnlocked } = useSecrets();

  /**
   * Handle Add button click
   * Check lock state before opening dialog (Requirements 10.1, 10.2)
   */
  const handleAddClick = () => {
    if (!isUnlocked) {
      toast.error("Please unlock secrets first");
      return;
    }
    setIsDialogOpen(true);
  };

  /**
   * Handle successful env vars addition
   * Update state optimistically and refetch (Requirements 7.1, 7.2)
   */
  const handleEnvVarsAdded = async (newVars: EnvVariable[]) => {
    // Optimistic update
    setEnvVars((prev) => [...newVars, ...prev]);

    // Refetch to ensure consistency (Requirement 7.1)
    await refetchEnvVars();
  };

  /**
   * Refetch env_vars from Supabase
   * Handles errors gracefully (Requirements 7.1, 7.4)
   */
  const refetchEnvVars = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("env_vars")
        .select(
          "id, project_id, user_id, key, iv, ciphertext, created_at, updated_at",
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Update state with fresh data (Requirement 7.2)
      setEnvVars(data || []);
    } catch (error) {
      // Keep previous data on error (Requirement 7.4)
      console.error("Failed to refetch env vars:", error);
      toast.warning("Failed to refresh data. Showing cached results.");
    }
  };

  /**
   * Toggle selection mode
   */
  const toggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set()); // Clear selections when toggling
  };

  /**
   * Handle individual selection change
   */
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  /**
   * Select all env vars
   */
  const handleSelectAll = () => {
    if (selectedIds.size === envVars.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(envVars.map((v) => v.id)));
    }
  };

  /**
   * Handle delete button click - opens confirmation dialog
   */
  const handleDeleteClick = () => {
    if (selectedIds.size === 0) {
      toast.error("No environment variables selected");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handle confirmed delete action
   */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);

    try {
      const result = await deleteEnvVariables(
        project.id,
        Array.from(selectedIds),
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        `Deleted ${result.data.count} environment variable${result.data.count !== 1 ? "s" : ""}`,
      );

      // Clear selections and exit selection mode
      setSelectedIds(new Set());
      setSelectionMode(false);

      // Refetch to update UI
      await refetchEnvVars();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete environment variables");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header (Requirements 1.2, 2.1, 9.4) */}
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
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
          <DownloadControls
            projectName={project.name}
            envVars={envVars}
            isUnlocked={isUnlocked}
          />
          {envVars.length > 0 && (
            <>
              {selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="gap-2"
                  >
                    {selectedIds.size === envVars.length ? (
                      <>
                        <Square className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Select All
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteClick}
                    disabled={selectedIds.size === 0 || isDeleting}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedIds.size})
                  </Button>
                  <Button variant="outline" onClick={toggleSelectionMode}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={toggleSelectionMode}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select
                </Button>
              )}
            </>
          )}
          <Button
            onClick={handleAddClick}
            disabled={!isUnlocked}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Lock Indicator (Requirement 10.4) */}
      <LockIndicator isUnlocked={isUnlocked} />

      {/* Add Environment Variable Dialog (Requirements 2.2, 2.3, 2.4, 2.5) */}
      <AddEnvDialog
        projectId={project.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEnvVarsAdded={handleEnvVarsAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment Variables</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size === 1
                ? "Are you sure you want to delete this environment variable? This action cannot be undone."
                : `Are you sure you want to delete ${selectedIds.size} environment variables? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Environment Variables Table or Empty State (Requirements 6.2, 6.5) */}
      {envVars.length > 0 ? (
        <EnvVariableTable
          envVars={envVars}
          projectName={project.name}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          selectionMode={selectionMode}
        />
      ) : (
        <EmptyState onAddEnvVar={handleAddClick} isUnlocked={isUnlocked} />
      )}
    </div>
  );
}
