"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ApiResponse } from "@/lib/types/api";

type DeleteAccountDialogProps = {
  userEmail: string;
};

export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const emailMatches = confirmEmail.toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!emailMatches) return;

    setIsDeleting(true);

    try {
      const res = await fetch("/api/v1/profile/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_email: confirmEmail }),
      });

      const json: ApiResponse<{ deleted: boolean }> = await res.json();

      if (!json.success) {
        toast.error(json.error || "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      // Sign out locally and redirect
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Your account has been deleted");
      router.push("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (isDeleting) return; // prevent closing during deletion
    setOpen(value);
    if (!value) setConfirmEmail("");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This will permanently delete your account, all projects, and all
              encrypted environment variables. This action cannot be undone.
            </span>
            <span className="block font-medium text-destructive">
              Type your email to confirm: {userEmail}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-email" className="sr-only">
            Confirm email
          </Label>
          <Input
            id="confirm-email"
            type="email"
            placeholder={userEmail}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!emailMatches || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
