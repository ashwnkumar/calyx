"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { deleteEnvFiles } from "@/app/(app)/projects/[id]/actions";

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

/**
 * EnvFileCard Component
 *
 * Card component displaying an environment file.
 * Clicking the card navigates to the env file details page.
 * Includes delete button with confirmation dialog.
 */
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);

    try {
      const result = await deleteEnvFiles(projectId, [envFile.id]);

      if (!result.success) {
        throw new Error(result.error);
      }

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
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{envFile.name}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created {formattedDate}
          </CardDescription>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Click to view and manage
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{envFile.name}"? This action
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
    </>
  );
}
