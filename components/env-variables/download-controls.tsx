"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decrypt } from "@/lib/crypto";
import { useSecrets } from "@/lib/contexts/SecretContext";
import { useState, useEffect } from "react";

type EnvVariable = {
  id: string;
  key: string;
  iv: string;
  ciphertext: string;
};

type DownloadControlsProps = {
  projectName: string;
  envVars: EnvVariable[];
  isUnlocked: boolean;
};

/**
 * DownloadControls Component
 *
 * Provides bulk download operations for decrypted environment variables.
 * Only visible when secrets are unlocked (isUnlocked === true).
 *
 * Features:
 * - Download all env vars in .env format (decrypted)
 * - Disabled when project has no env vars
 * - Toast notifications on success/error
 */
export function DownloadControls({
  projectName,
  envVars,
  isUnlocked,
}: DownloadControlsProps) {
  const { cryptoKey } = useSecrets();
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Only show when unlocked
  if (!isUnlocked) {
    return null;
  }

  const isEmpty = envVars.length === 0;

  /**
   * Handle Download All (.env) button click
   * Decrypts all values and downloads as .env format
   */
  const handleDownloadEnv = async () => {
    if (!cryptoKey) {
      toast.error("Crypto key not available");
      return;
    }

    setIsDecrypting(true);

    try {
      // Decrypt all env vars
      const decryptedEntries = await Promise.all(
        envVars.map(async (envVar) => {
          try {
            const plaintext = await decrypt(
              envVar.iv,
              envVar.ciphertext,
              cryptoKey,
            );
            return `${envVar.key}=${plaintext}`;
          } catch (error) {
            console.error(`Failed to decrypt ${envVar.key}:`, error);
            throw new Error(`Failed to decrypt ${envVar.key}`);
          }
        }),
      );

      // Create .env content
      const envContent = decryptedEntries.join("\n");

      // Create blob and trigger download
      const blob = new Blob([envContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${projectName.toLowerCase().replace(/\s+/g, "_")}.env`;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success(`Downloaded ${envVars.length} variables as .env`);
    } catch (error) {
      console.error("Download .env failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download .env file",
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadEnv}
        disabled={isEmpty || isDecrypting}
        className="gap-2"
        aria-label="Download all decrypted variables as .env file"
      >
        <Download className="h-4 w-4" />
        {isDecrypting ? "Decrypting..." : "Download All as .env"}
      </Button>
    </div>
  );
}
