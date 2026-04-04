"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Calendar, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type EnvFileCardProps = {
  envFile: EnvFile;
  projectId: string;
  onDeleted: (fileId: string) => void;
};

export function EnvFileCard({
  envFile,
  projectId,
  onDeleted,
}: EnvFileCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    router.push(`/projects/${projectId}/env/${envFile.id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/env`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [envFile.id] }),
      });
      const result: ApiResponse<{ count: number }> = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success(`Deleted environment file: ${envFile.name}`);
      onDeleted(envFile.id);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete environment file");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(envFile.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <CardTitle className="text-base truncate">
                {envFile.name}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Actions for ${envFile.name}`}
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
        </CardHeader>
        <CardContent>
          <CardDescription className="flex items-center gap-1.5 text-xs">
            <Calendar className="size-3.5" />
            Created {formattedDate}
          </CardDescription>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{envFile.name}&rdquo;? This
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
    </>
  );
}
