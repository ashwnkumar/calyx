"use client";

import { formatDistanceToNow } from "date-fns";
import { Lock, LockOpen, Copy, Download, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { useState, useEffect } from "react";
import { decrypt } from "@/lib/crypto";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadSingleEncrypted, isValidBase64 } from "@/lib/download-utils";
import { toast } from "sonner";

type EnvVariable = {
  id: string;
  key: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

type EnvVariableCardProps = {
  envVar: EnvVariable;
  projectName: string;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
};

export function EnvVariableCard({
  envVar,
  projectName,
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
}: EnvVariableCardProps) {
  const { isUnlocked, cryptoKey } = useSecrets();
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);

  const formattedDate = formatDistanceToNow(new Date(envVar.created_at), {
    addSuffix: true,
  });

  // Validate encrypted data format
  const isValidData =
    isValidBase64(envVar.iv) && isValidBase64(envVar.ciphertext);

  // Handle copy decrypted value to clipboard
  const handleCopyDecrypted = async () => {
    if (!decryptedValue) {
      toast.error("Cannot copy: value not decrypted");
      return;
    }

    const success = await copyToClipboard(decryptedValue);
    if (success) {
      toast.success("Copied to clipboard");
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle download single decrypted variable as .env format
  const handleDownloadDecrypted = () => {
    if (!decryptedValue) {
      toast.error("Cannot download: value not decrypted");
      return;
    }

    try {
      // Create .env format content
      const envContent = `${envVar.key}=${decryptedValue}`;

      // Create blob and trigger download
      const blob = new Blob([envContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${projectName.toLowerCase().replace(/\s+/g, "_")}_${envVar.key.toLowerCase()}.env`;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success("Downloaded decrypted variable");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  // Decrypt value when unlocked
  useEffect(() => {
    let isMounted = true;

    async function loadDecryptedValue() {
      // Only decrypt when unlocked and key is available
      if (!isUnlocked || !cryptoKey) {
        setDecryptedValue(null);
        return;
      }

      try {
        const plaintext = await decrypt(
          envVar.iv,
          envVar.ciphertext,
          cryptoKey,
        );
        if (isMounted) {
          setDecryptedValue(plaintext);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Decryption failed:", error);
          toast.error("Failed to decrypt value");
          setDecryptedValue(null);
        }
      }
    }

    loadDecryptedValue();

    return () => {
      isMounted = false;
    };
  }, [isUnlocked, cryptoKey, envVar.iv, envVar.ciphertext]);

  return (
    <Card
      className={`p-3 sm:p-4 ${!isValidData ? "border-destructive" : ""} ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      {!isValidData && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-xs text-destructive">
            Invalid encrypted data format
          </p>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {selectionMode && onSelectionChange && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelectionChange(envVar.id, checked === true)
              }
              aria-label={`Select ${envVar.key}`}
            />
          )}
          <h3 className="font-semibold text-sm">{envVar.key}</h3>
        </div>
        {isUnlocked ? (
          <LockOpen className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Key</p>
          <p className="text-sm font-mono">{envVar.key}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Value</p>
          {isUnlocked ? (
            <div className="space-y-2">
              <p className="text-sm font-mono break-all">
                {decryptedValue || "••••••••"}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDecrypted}
                  className="flex-1"
                  disabled={!decryptedValue}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Value
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDecrypted}
                  className="flex-1"
                  disabled={!decryptedValue}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as .env
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-muted/50 rounded-md border border-muted">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {envVar.ciphertext}
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{formattedDate}</p>
      </div>
    </Card>
  );
}
