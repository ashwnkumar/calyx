"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileKey, MoreVertical, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ApiResponse } from "@/lib/types/api";

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

  const handleConfirmDelete = () => {
    const envVarCount = project.env_vars?.[0]?.count ?? 0;
    if (envVarCount > 0) {
      setIsDeleteDialogOpen(false);
      setIsEnvVarsWarningOpen(true);
    } else {
      performDelete();
    }
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}`, {
        method: "DELETE",
      });
      const result: ApiResponse<{ id: string }> = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success(`Project "${project.name}" deleted successfully`);
      onProjectDeleted(project.id);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setIsEnvVarsWarningOpen(false);
    }
  };

  const createdDate = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
  });
  const updatedDate = formatDistanceToNow(new Date(project.updated_at), {
    addSuffix: true,
  });
  const envVarCount = project.env_vars?.[0]?.count ?? 0;

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg flex-1 wrap-break-word leading-snug">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="secondary" className="gap-1 text-xs">
                <FileKey className="size-3" />
                {envVarCount}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Actions for ${project.name}`}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2 mt-1">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span>Updated {updatedDate}</span>
            <span>Created {createdDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{project.name}&rdquo;? This
              action cannot be undone.
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

      {/* Env Vars Warning */}
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
              onClick={performDelete}
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
