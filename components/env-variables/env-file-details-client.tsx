"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  Edit,
  Save,
  X,
  Lock,
  Pencil,
  Check,
  History,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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
import type { ApiResponse, EnvFile as ApiEnvFile } from "@/lib/types/api";

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

function LineNumbers({ count }: { count: number }) {
  return (
    <div
      className="select-none text-right pr-3 border-r border-border/50 text-muted-foreground/50 font-mono text-xs sm:text-sm leading-relaxed"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  );
}

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

  const lineCount = useMemo(() => {
    if (!decryptedContent) return 0;
    return decryptedContent.split("\n").length;
  }, [decryptedContent]);

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
    if (!isUnlocked || !decryptedContent) {
      toast.error("Unlock secrets to copy content");
      return;
    }
    const success = await copyToClipboard(decryptedContent);
    if (success) toast.success("Copied to clipboard");
    else toast.error("Failed to copy to clipboard");
  };

  const handleDownload = () => {
    if (!isUnlocked || !decryptedContent) {
      toast.error("Unlock secrets to download");
      return;
    }
    const filename = `${project.name}-${currentEnvFile.name}.env`;
    triggerDownload(filename, decryptedContent);
    toast.success("File downloaded");
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
      toast.error("Secrets are locked");
      return;
    }
    if (!editedContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const { iv, ciphertext } = await encrypt(editedContent, cryptoKey);
      const res = await fetch(
        `/api/v1/projects/${project.id}/env/${currentEnvFile.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iv, ciphertext }),
        },
      );
      const result: ApiResponse<EnvFile> = await res.json();
      if (!result.success) throw new Error(result.error);
      setCurrentEnvFile(result.data);
      setDecryptedContent(editedContent);
      setIsEditing(false);
      setEditedContent("");
      toast.success("Environment file updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
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
      const res = await fetch(
        `/api/v1/projects/${project.id}/env/${currentEnvFile.id}/name`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        },
      );
      const result: ApiResponse<EnvFile> = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success("Name updated");
      setIsEditingName(false);
      setCurrentEnvFile(result.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSaveName();
    else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditedName(currentEnvFile.name);
    }
  };

  const formattedDate = new Date(currentEnvFile.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-foreground truncate max-w-[120px]"
        >
          {project.name}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[150px]">
          {currentEnvFile.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                disabled={isSavingName}
                className="text-xl sm:text-2xl font-bold h-auto py-1 px-2"
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
                  setEditedName(currentEnvFile.name);
                }}
                disabled={isSavingName}
                aria-label="Cancel edit"
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {currentEnvFile.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditingName(true);
                  setEditedName(currentEnvFile.name);
                }}
                className="size-7 opacity-0 group-hover:opacity-100"
                aria-label="Edit file name"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Created {formattedDate}
          </p>
        </div>

        {/* Action buttons — fixed width on desktop, no flex-1 stretching */}
        <div className="flex flex-wrap gap-2">
          {isUnlocked && (
            <>
              <Button onClick={handleCopy} size="sm" className="gap-1.5">
                <Copy className="size-3.5" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                size="sm"
                className="gap-1.5"
              >
                <Download className="size-3.5" />
                Download
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() =>
              router.push(
                `/projects/${project.id}/env/${currentEnvFile.id}/history`,
              )
            }
            size="sm"
            className="gap-1.5"
          >
            <History className="size-3.5" />
            History
          </Button>
          {isUnlocked && !isEditing && (
            <Button
              variant="outline"
              onClick={handleEditClick}
              size="sm"
              className="gap-1.5"
            >
              <Edit className="size-3.5" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                size="sm"
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                size="sm"
                className="gap-1.5"
              >
                <X className="size-3.5" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isUnlocked
              ? isEditing
                ? "Editing"
                : "Environment Variables"
              : "Encrypted Content"}
          </CardTitle>
          {!isUnlocked && (
            <CardDescription>
              Unlock your secrets from the header to view and edit this file
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isDecrypting ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Decrypting...</p>
            </div>
          ) : isUnlocked && decryptedContent !== null ? (
            isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                disabled={isSaving}
                className="font-mono text-xs sm:text-sm min-h-[350px] resize-none leading-relaxed"
                placeholder="Paste your .env file content here..."
              />
            ) : (
              <div className="flex bg-muted rounded-md overflow-hidden">
                <LineNumbers count={lineCount} />
                <pre className="font-mono text-xs sm:text-sm p-3 sm:p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word flex-1 leading-relaxed">
                  {decryptedContent}
                </pre>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Lock className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                This content is encrypted. Unlock to view.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
