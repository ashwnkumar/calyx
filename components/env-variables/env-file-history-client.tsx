"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Lock,
  RotateCcw,
  Eye,
  FileText,
  GitCompare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { decrypt } from "@/lib/crypto";
import type { ApiResponse } from "@/lib/types/api";
import { generateDiff, getDiffStats, type DiffLine } from "@/lib/diff-utils";

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

type EnvVarVersion = {
  id: string;
  env_var_id: string;
  version_number: number;
  change_type: "created" | "updated" | "deleted";
  changed_at: string;
  change_note: string | null;
  name: string;
  iv: string;
  ciphertext: string;
};

type EnvFileHistoryClientProps = {
  project: Project;
  envFile: EnvFile;
};

export function EnvFileHistoryClient({
  project,
  envFile,
}: EnvFileHistoryClientProps) {
  const router = useRouter();
  const { cryptoKey, isUnlocked, promptUnlock } = useSecrets();
  const [versions, setVersions] = useState<EnvVarVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<EnvVarVersion | null>(
    null,
  );
  const [decryptedValue, setDecryptedValue] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "diff">("preview");
  const [compareVersion, setCompareVersion] = useState<EnvVarVersion | null>(
    null,
  );
  const [compareDecryptedValue, setCompareDecryptedValue] =
    useState<string>("");
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  useEffect(() => {
    loadHistory();
  }, [envFile.id]);

  // Auto-select first version when loaded
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      handleSelectVersion(versions[0]);
    }
  }, [versions]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/env/${envFile.id}/versions`);
      const result: ApiResponse<EnvVarVersion[]> = await res.json();

      if (result.success) {
        setVersions(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to load version history");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectVersion(version: EnvVarVersion) {
    setSelectedVersion(version);
    setDecryptedValue("");

    if (!isUnlocked || !cryptoKey) {
      return;
    }

    setIsDecrypting(true);
    try {
      const decrypted = await decrypt(
        version.iv,
        version.ciphertext,
        cryptoKey,
      );
      setDecryptedValue(decrypted);

      // If in diff mode, generate diff with previous version
      if (viewMode === "diff") {
        await generateDiffWithPrevious(version, decrypted);
      }
    } catch (err) {
      console.error("Failed to decrypt version:", err);
      toast.error("Failed to decrypt version");
      setDecryptedValue("");
    } finally {
      setIsDecrypting(false);
    }
  }

  async function generateDiffWithPrevious(
    currentVersion: EnvVarVersion,
    currentDecrypted: string,
  ) {
    if (!cryptoKey) return;

    // Find the previous version
    const currentIndex = versions.findIndex((v) => v.id === currentVersion.id);
    if (currentIndex === -1 || currentIndex === versions.length - 1) {
      // No previous version
      setDiffLines([]);
      setCompareVersion(null);
      return;
    }

    const previousVersion = versions[currentIndex + 1];
    setCompareVersion(previousVersion);

    try {
      const previousDecrypted = await decrypt(
        previousVersion.iv,
        previousVersion.ciphertext,
        cryptoKey,
      );
      setCompareDecryptedValue(previousDecrypted);

      // Generate diff (previous -> current)
      const diff = generateDiff(previousDecrypted, currentDecrypted);
      setDiffLines(diff);
    } catch (err) {
      console.error("Failed to decrypt previous version:", err);
      toast.error("Failed to generate diff");
      setDiffLines([]);
    }
  }

  async function handleViewModeChange(mode: "preview" | "diff") {
    setViewMode(mode);

    if (mode === "diff" && selectedVersion && decryptedValue && isUnlocked) {
      await generateDiffWithPrevious(selectedVersion, decryptedValue);
    }
  }

  async function handleRestore(versionId: string) {
    if (
      !confirm(
        "Are you sure you want to restore this version? This will create a new version with the restored content.",
      )
    ) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetch(
        `/api/v1/env/${envFile.id}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      const result: ApiResponse<{ restored: boolean }> = await res.json();

      if (result.success) {
        toast.success("Version restored successfully");
        router.push(`/projects/${project.id}/env/${envFile.id}`);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  }

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case "created":
        return <Badge variant="default">Created</Badge>;
      case "updated":
        return <Badge variant="secondary">Updated</Badge>;
      case "deleted":
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{changeType}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/projects/${project.id}/env/${envFile.id}`)
            }
            aria-label="Back to file"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              Version History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">{envFile.name}</span> •{" "}
              {project.name}
            </p>
          </div>
        </div>
      </div>

      {!isUnlocked ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Lock className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock your secrets to view version history
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={promptUnlock}
                className="gap-1.5"
              >
                <Lock className="size-3.5" />
                Unlock Secrets
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Two-column layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Version Tree */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Loading versions...
                  </div>
                ) : versions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No version history available
                  </div>
                ) : (
                  <div className="divide-y">
                    {versions.map((version, index) => (
                      <button
                        key={version.id}
                        onClick={() => handleSelectVersion(version)}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                          selectedVersion?.id === version.id
                            ? "bg-muted border-l-4 border-primary"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              v{version.version_number}
                            </span>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          {getChangeTypeBadge(version.change_type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(version.changed_at), {
                            addSuffix: true,
                          })}
                        </div>
                        {version.change_note && (
                          <div className="text-xs text-muted-foreground italic mt-1">
                            {version.change_note}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: File Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {viewMode === "preview" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <GitCompare className="h-5 w-5" />
                    )}
                    {selectedVersion
                      ? viewMode === "preview"
                        ? `Version ${selectedVersion.version_number} Preview`
                        : `Version ${selectedVersion.version_number} Diff`
                      : "Select a version"}
                  </CardTitle>
                  <div className="flex gap-2">
                    {selectedVersion && isUnlocked && (
                      <div className="flex gap-1 border rounded-md p-1">
                        <Button
                          size="sm"
                          variant={viewMode === "preview" ? "default" : "ghost"}
                          onClick={() => handleViewModeChange("preview")}
                          className="h-7 px-2"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === "diff" ? "default" : "ghost"}
                          onClick={() => handleViewModeChange("diff")}
                          className="h-7 px-2"
                          disabled={
                            versions.findIndex(
                              (v) => v.id === selectedVersion.id,
                            ) ===
                            versions.length - 1
                          }
                        >
                          <GitCompare className="h-3 w-3 mr-1" />
                          Diff
                        </Button>
                      </div>
                    )}
                    {selectedVersion &&
                      versions.findIndex((v) => v.id === selectedVersion.id) !==
                        0 && (
                        <Button
                          size="sm"
                          onClick={() => handleRestore(selectedVersion.id)}
                          disabled={!isUnlocked || isRestoring}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {isRestoring ? "Restoring..." : "Restore"}
                        </Button>
                      )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedVersion ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a version from the list to preview</p>
                    </div>
                  </div>
                ) : isDecrypting ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Decrypting...
                  </div>
                ) : decryptedValue ? (
                  viewMode === "preview" ? (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Changed{" "}
                          {formatDistanceToNow(
                            new Date(selectedVersion.changed_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </div>
                      </div>
                      <pre className="font-mono text-xs sm:text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words max-h-[600px] overflow-y-auto">
                        {decryptedValue}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      {compareVersion && (
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Comparing v{compareVersion.version_number} → v
                            {selectedVersion.version_number}
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">
                              +{getDiffStats(diffLines).added} added
                            </span>
                            <span className="text-red-600">
                              -{getDiffStats(diffLines).removed} removed
                            </span>
                          </div>
                        </div>
                      )}
                      {diffLines.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No previous version to compare
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden max-h-[600px] overflow-y-auto">
                          <div className="font-mono text-xs sm:text-sm">
                            {diffLines.map((line, index) => (
                              <div
                                key={index}
                                className={`px-4 py-1 ${
                                  line.type === "added"
                                    ? "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100"
                                    : line.type === "removed"
                                      ? "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100"
                                      : "bg-background"
                                }`}
                              >
                                <span
                                  className={`inline-block w-6 mr-2 text-muted-foreground select-none ${
                                    line.type === "added"
                                      ? "text-green-600 dark:text-green-400"
                                      : line.type === "removed"
                                        ? "text-red-600 dark:text-red-400"
                                        : ""
                                  }`}
                                >
                                  {line.type === "added"
                                    ? "+"
                                    : line.type === "removed"
                                      ? "-"
                                      : " "}
                                </span>
                                <span className="whitespace-pre-wrap break-all">
                                  {line.content || " "}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Failed to decrypt version
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
