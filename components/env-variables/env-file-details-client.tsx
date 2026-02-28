"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Edit,
  Save,
  X,
  Lock,
  LockOpen,
  Pencil,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { decrypt, encrypt } from "@/lib/crypto";
import { copyToClipboard } from "@/lib/clipboard-utils";
import {
  updateEnvFile,
  updateEnvFileName,
} from "@/app/(app)/projects/[id]/env/[fileId]/actions";
import { LockIndicator } from "./lock-indicator";

type Project = {
  id: string;
  name: string;
  description: string | null;
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

type EnvFileDetailsClientProps = {
  project: Project;
  envFile: EnvFile;
};

/**
 * EnvFileDetailsClient Component
 *
 * Displays and manages a single environment file.
 * Shows encrypted content when locked, decrypted content when unlocked.
 * Supports copy, download, and edit operations.
 */
export function EnvFileDetailsClient({
  project,
  envFile,
}: EnvFileDetailsClientProps) {
  const router = useRouter();
  const { cryptoKey, isUnlocked } = useSecrets();
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentEnvFile, setCurrentEnvFile] = useState(envFile);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(envFile.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Helper function to trigger file download
  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Decrypt content when unlocked
  useEffect(() => {
    if (isUnlocked && cryptoKey) {
      decryptContent();
    } else {
      setDecryptedContent(null);
      setIsEditing(false);
    }
  }, [isUnlocked, cryptoKey, currentEnvFile.iv, currentEnvFile.ciphertext]);

  const decryptContent = async () => {
    if (!cryptoKey) return;

    setIsDecrypting(true);
    try {
      const content = await decrypt(
        currentEnvFile.iv,
        currentEnvFile.ciphertext,
        cryptoKey,
      );
      setDecryptedContent(content);
    } catch (error) {
      console.error("Decryption failed:", error);
      toast.error("Failed to decrypt environment file");
      setDecryptedContent(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    const content = isUnlocked
      ? decryptedContent
      : `${currentEnvFile.iv}:${currentEnvFile.ciphertext}`;
    if (!content) {
      toast.error("No content to copy");
      return;
    }

    const success = await copyToClipboard(content);
    if (success) {
      toast.success(
        isUnlocked
          ? "Decrypted content copied to clipboard"
          : "Encrypted content copied to clipboard",
      );
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const content = isUnlocked
      ? decryptedContent
      : `${currentEnvFile.iv}:${currentEnvFile.ciphertext}`;
    if (!content) {
      toast.error("No content to download");
      return;
    }

    const filename = isUnlocked
      ? `${project.name}-${currentEnvFile.name}.env`
      : `${project.name}-${currentEnvFile.name}.encrypted.txt`;

    triggerDownload(filename, content);
    toast.success("File downloaded successfully");
  };

  const handleEditClick = () => {
    if (!decryptedContent) return;
    setEditedContent(decryptedContent);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const handleSaveEdit = async () => {
    if (!cryptoKey) {
      toast.error("Secrets are locked. Cannot save changes.");
      return;
    }

    if (!editedContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      // Encrypt the edited content
      const { iv, ciphertext } = await encrypt(editedContent, cryptoKey);

      // Call server action to update
      const result = await updateEnvFile(project.id, currentEnvFile.id, {
        iv,
        ciphertext,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setCurrentEnvFile(result.data);
      setDecryptedContent(editedContent);
      setIsEditing(false);
      setEditedContent("");

      toast.success("Environment file updated successfully");
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setEditedName(currentEnvFile.name);
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setEditedName(currentEnvFile.name);
  };

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty");
      return;
    }

    if (trimmedName === currentEnvFile.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);

    try {
      const result = await updateEnvFileName(
        project.id,
        currentEnvFile.id,
        trimmedName,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Environment file name updated successfully");
      setIsEditingName(false);
      setCurrentEnvFile(result.data);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelNameEdit();
    }
  };

  const formattedDate = new Date(currentEnvFile.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-5xl">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        {/* Back button and title row */}
        <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${project.id}`)}
            aria-label="Back to project"
            className="shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  disabled={isSavingName}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold h-auto py-1 px-2"
                  maxLength={100}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  aria-label="Save name"
                  className="shrink-0"
                >
                  <Check className="h-5 w-5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelNameEdit}
                  disabled={isSavingName}
                  aria-label="Cancel edit"
                  className="shrink-0"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  {currentEnvFile.name}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditNameClick}
                  className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Edit file name"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {isUnlocked ? (
                  <LockOpen className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {project.name} • Created {formattedDate}
            </p>
          </div>
        </div>

        {/* Action buttons - responsive layout */}
        <div className="flex flex-wrap gap-2 ml-0 sm:ml-14">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          {isUnlocked && !isEditing && (
            <Button
              variant="outline"
              onClick={handleEditClick}
              className="gap-2 flex-1 sm:flex-none"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="gap-2 flex-1 sm:flex-none"
                size="sm"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="gap-2 flex-1 sm:flex-none"
                size="sm"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lock Indicator */}
      <LockIndicator isUnlocked={isUnlocked} />

      {/* Content Display */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {isUnlocked ? "Environment Variables" : "Encrypted Content"}
          </CardTitle>
          <CardDescription className="text-sm">
            {isUnlocked
              ? isEditing
                ? "Edit your environment variables below"
                : "Your decrypted environment variables"
              : "Unlock to view decrypted content"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDecrypting ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-muted-foreground text-sm">Decrypting...</div>
            </div>
          ) : isUnlocked && decryptedContent !== null ? (
            isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                disabled={isSaving}
                className="font-mono text-xs sm:text-sm min-h-[300px] sm:min-h-[400px] resize-none"
                placeholder="Paste your .env file content here..."
              />
            ) : (
              <pre className="font-mono text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                {decryptedContent}
              </pre>
            )
          ) : (
            <div className="bg-muted p-3 sm:p-4 rounded-md">
              <pre className="font-mono text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                {currentEnvFile.ciphertext.substring(0, 200)}
                {currentEnvFile.ciphertext.length > 200 && "..."}
              </pre>
              <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                This content is encrypted. Unlock your secrets to view the
                decrypted content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
