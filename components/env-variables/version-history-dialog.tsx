"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, Eye, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { decrypt } from "@/lib/crypto";
import type { ApiResponse } from "@/lib/types/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

type VersionHistoryDialogProps = {
  envVarId: string;
  envVarKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: () => void;
};

export function VersionHistoryDialog({
  envVarId,
  envVarKey,
  open,
  onOpenChange,
  onRestore,
}: VersionHistoryDialogProps) {
  const { cryptoKey, isUnlocked } = useSecrets();
  const [versions, setVersions] = useState<EnvVarVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<EnvVarVersion | null>(
    null,
  );
  const [decryptedValue, setDecryptedValue] = useState<string>("");
  const [viewingVersion, setViewingVersion] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadHistory();
    } else {
      // Reset state when dialog closes
      setSelectedVersion(null);
      setDecryptedValue("");
      setViewingVersion(null);
    }
  }, [open, envVarId]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/env/${envVarId}/versions`);
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

  async function viewVersion(versionId: string) {
    if (!isUnlocked || !cryptoKey) {
      toast.error("Unlock secrets first to view version");
      return;
    }

    setViewingVersion(versionId);
    setDecryptedValue("");

    try {
      const res = await fetch(`/api/v1/env/${envVarId}/versions/${versionId}`);
      const result: ApiResponse<EnvVarVersion> = await res.json();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const version = result.data;
      const decrypted = await decrypt(
        version.iv,
        version.ciphertext,
        cryptoKey,
      );

      setDecryptedValue(decrypted);
      setSelectedVersion(version);
    } catch (err) {
      console.error("Failed to decrypt version:", err);
      toast.error("Failed to decrypt version");
      setDecryptedValue("");
    } finally {
      setViewingVersion(null);
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

    try {
      const res = await fetch(
        `/api/v1/env/${envVarId}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      const result: ApiResponse<{ restored: boolean }> = await res.json();

      if (result.success) {
        toast.success("Version restored successfully");
        onOpenChange(false);
        if (onRestore) {
          onRestore();
        }
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to restore version");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of{" "}
            <code className="font-mono">{envVarKey}</code>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked && (
          <Alert>
            <AlertDescription>
              Unlock your secrets to view and restore version values
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading version history...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No version history available
            </div>
          ) : (
            <>
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 ${
                    selectedVersion?.id === version.id
                      ? "bg-muted/50 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Version {version.version_number}
                        </span>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {getChangeTypeBadge(version.change_type)}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(version.changed_at), {
                          addSuffix: true,
                        })}
                      </div>

                      {version.change_note && (
                        <div className="text-sm italic text-muted-foreground">
                          {version.change_note}
                        </div>
                      )}

                      {selectedVersion?.id === version.id && decryptedValue && (
                        <div className="mt-3 p-3 bg-background rounded border">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Decrypted Value:
                          </div>
                          <code className="text-sm break-all">
                            {decryptedValue}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewVersion(version.id)}
                        disabled={!isUnlocked || viewingVersion === version.id}
                      >
                        {viewingVersion === version.id ? (
                          "Loading..."
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </>
                        )}
                      </Button>

                      {index !== 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                          disabled={!isUnlocked}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
