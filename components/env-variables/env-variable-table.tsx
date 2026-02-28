"use client";

import { formatDistanceToNow } from "date-fns";
import { Lock, LockOpen, Copy, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { useState, useEffect } from "react";
import { decrypt } from "@/lib/crypto";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { isValidBase64 } from "@/lib/download-utils";
import { toast } from "sonner";

type EnvVariable = {
  id: string;
  key: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

type EnvVariableTableProps = {
  envVars: EnvVariable[];
  projectName: string;
  selectedIds?: Set<string>;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
};

function EnvVariableRow({
  envVar,
  projectName,
  isSelected,
  onSelectionChange,
  selectionMode,
}: {
  envVar: EnvVariable;
  projectName: string;
  isSelected: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode: boolean;
}) {
  const { isUnlocked, cryptoKey } = useSecrets();
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);

  const formattedDate = formatDistanceToNow(new Date(envVar.created_at), {
    addSuffix: true,
  });

  // Validate encrypted data format
  const isValidData =
    isValidBase64(envVar.iv) && isValidBase64(envVar.ciphertext);

  // Handle copy decrypted key-value pair to clipboard
  const handleCopyDecrypted = async () => {
    if (!decryptedValue) {
      toast.error("Cannot copy: value not decrypted");
      return;
    }

    try {
      const envPair = `${envVar.key}=${decryptedValue}`;
      await copyToClipboard(envPair);
    } catch (error) {
      // Error already handled by copyToClipboard
    }
  };

  // Handle download single decrypted variable as .env format
  const handleDownloadDecrypted = () => {
    if (!decryptedValue) {
      toast.error("Cannot download: value not decrypted");
      return;
    }

    try {
      const envContent = `${envVar.key}=${decryptedValue}`;
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
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      {selectionMode && onSelectionChange && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectionChange(envVar.id, checked === true)
            }
            aria-label={`Select ${envVar.key}`}
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-2">
          {!isValidData && <AlertCircle className="h-4 w-4 text-destructive" />}
          <code className="text-sm font-medium">{envVar.key}</code>
        </div>
      </TableCell>
      <TableCell className="max-w-md">
        {isUnlocked ? (
          <div className="flex items-center gap-2">
            {decryptedValue && decryptedValue.length > 30 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="text-sm break-all flex-1 cursor-help">
                    {decryptedValue.substring(0, 30)}...
                  </code>
                </TooltipTrigger>
                <TooltipContent className="max-w-md break-all">
                  <p className="font-mono text-xs">{decryptedValue}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <code className="text-sm break-all flex-1">
                {decryptedValue || "••••••••"}
              </code>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyDecrypted}
                disabled={!decryptedValue}
                title="Copy KEY=VALUE"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadDecrypted}
                disabled={!decryptedValue}
                title="Download as .env"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <code className="text-sm text-muted-foreground break-all">
            {envVar.ciphertext.substring(0, 40)}...
          </code>
        )}
      </TableCell>
      <TableCell className="text-center">
        {isUnlocked ? (
          <LockOpen className="h-4 w-4 text-muted-foreground inline" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground inline" />
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formattedDate}
      </TableCell>
    </TableRow>
  );
}

export function EnvVariableTable({
  envVars,
  projectName,
  selectedIds = new Set(),
  onSelectionChange,
  selectionMode = false,
}: EnvVariableTableProps) {
  if (envVars.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && <TableHead className="w-12"></TableHead>}
              <TableHead>Key</TableHead>
              <TableHead className="max-w-md">Value</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {envVars.map((envVar) => (
              <EnvVariableRow
                key={envVar.id}
                envVar={envVar}
                projectName={projectName}
                isSelected={selectedIds.has(envVar.id)}
                onSelectionChange={onSelectionChange}
                selectionMode={selectionMode}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
