"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileKey, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { deleteProject } from "@/app/(app)/actions";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

type ProjectCardProps = {
  project: Project;
  onProjectDeleted: (projectId: string) => void;
};

export function ProjectCard({ project, onProjectDeleted }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEnvVarsWarningOpen, setIsEnvVarsWarningOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const envVarCount = project.env_vars?.[0]?.count ?? 0;

    // If project has env vars, show additional warning
    if (envVarCount > 0) {
      setIsDeleteDialogOpen(false);
      setIsEnvVarsWarningOpen(true);
    } else {
      // No env vars, proceed with deletion
      performDelete();
    }
  };

  const handleFinalConfirmDelete = () => {
    setIsEnvVarsWarningOpen(false);
    performDelete();
  };

  const performDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteProject(project.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(`Project "${project.name}" deleted successfully`);
      onProjectDeleted(project.id);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formattedDate = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
  });

  // Extract count from the aggregated query result
  const envVarCount = project.env_vars?.[0]?.count ?? 0;

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 relative group"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl flex-1 break-words">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <FileKey className="h-3.5 w-3.5" />
                {envVarCount}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                aria-label={`Delete ${project.name}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Created {formattedDate}
          </p>
        </CardContent>
      </Card>

      {/* Initial Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action
              cannot be undone.
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

      {/* Environment Variables Warning Dialog */}
      <AlertDialog
        open={isEnvVarsWarningOpen}
        onOpenChange={setIsEnvVarsWarningOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Warning: Project Contains Secrets
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This project contains{" "}
                <strong>
                  {envVarCount} environment variable
                  {envVarCount !== 1 ? "s" : ""}
                </strong>
                .
              </p>
              <p>
                Deleting this project will permanently delete all associated
                encrypted environment variables. This action cannot be undone.
              </p>
              <p className="font-semibold text-foreground">
                Are you absolutely sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
