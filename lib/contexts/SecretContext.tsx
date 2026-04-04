"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { deriveKey, encrypt, decrypt } from "@/lib/crypto";
import { toast } from "sonner";
import type { ApiResponse } from "@/lib/types/api";

type ProfileData = {
  encryption_salt: string;
  test_iv: string | null;
  test_ciphertext: string | null;
  has_passphrase: boolean;
};

type SecretState = {
  cryptoKey: CryptoKey | null;
  isUnlocked: boolean;
  isPassphraseSetup: boolean;
  isLoading: boolean;
};

type SecretActions = {
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
  changePassphrase: (
    oldPassphrase: string,
    newPassphrase: string,
  ) => Promise<void>;
};

type SecretContextValue = SecretState & SecretActions;

const SecretContext = createContext<SecretContextValue | undefined>(undefined);

/**
 * Fetch profile from API. Throws on failure.
 */
async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch("/api/v1/profile");
  const json: ApiResponse<ProfileData> = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to load profile");
  }

  return json.data;
}

/**
 * Update passphrase verification blob via API. Throws on failure.
 */
async function updatePassphrase(testIv: string, testCiphertext: string) {
  const res = await fetch("/api/v1/profile/passphrase", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_iv: testIv, test_ciphertext: testCiphertext }),
  });
  const json: ApiResponse<{ updated: boolean }> = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to update passphrase data");
  }
}

export function SecretProvider({ children }: { children: ReactNode }) {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPassphraseSetup, setIsPassphraseSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unlock = useCallback(async (passphrase: string) => {
    try {
      const profile = await fetchProfile();

      if (!profile.encryption_salt) {
        throw new Error("No encryption salt found");
      }

      // Derive AES key from passphrase + salt
      const key = await deriveKey(passphrase, profile.encryption_salt);

      // Verify passphrase correctness if test value exists
      if (profile.test_iv && profile.test_ciphertext) {
        let decryptedTest: string;
        try {
          decryptedTest = await decrypt(
            profile.test_iv,
            profile.test_ciphertext,
            key,
          );
        } catch {
          // AES-GCM decryption fails with DOMException when key is wrong
          throw new Error("Incorrect passphrase — please try again");
        }

        if (decryptedTest !== "UNLOCK_OK") {
          throw new Error("Incorrect passphrase — please try again");
        }
      }

      // Success → store key in memory
      setCryptoKey(key);
      setIsUnlocked(true);

      // If this is first unlock (no test yet) → create verification blob
      if (!profile.test_ciphertext) {
        const { iv, ciphertext } = await encrypt("UNLOCK_OK", key);
        await updatePassphrase(iv, ciphertext);

        setIsPassphraseSetup(true);
        toast.success("Passphrase protection set up successfully");
      } else {
        toast.success("Secrets unlocked");
      }
    } catch (err) {
      console.error("Unlock failed:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Incorrect passphrase – please try again",
      );
      throw err;
    }
  }, []);

  const lock = useCallback(() => {
    setCryptoKey(null);
    setIsUnlocked(false);
    toast.info("Secrets locked");
  }, []);

  const changePassphrase = useCallback(
    async (oldPassphrase: string, newPassphrase: string) => {
      try {
        // 1. Fetch profile with salt
        const profile = await fetchProfile();

        if (!profile.encryption_salt) {
          throw new Error("No encryption salt found");
        }

        // 2. Verify old passphrase
        const oldKey = await deriveKey(oldPassphrase, profile.encryption_salt);

        if (profile.test_iv && profile.test_ciphertext) {
          let decryptedTest: string;
          try {
            decryptedTest = await decrypt(
              profile.test_iv,
              profile.test_ciphertext,
              oldKey,
            );
          } catch {
            throw new Error("Current passphrase is incorrect");
          }

          if (decryptedTest !== "UNLOCK_OK") {
            throw new Error("Current passphrase is incorrect");
          }
        }

        // 3. Derive new key
        const newKey = await deriveKey(newPassphrase, profile.encryption_salt);

        // 4. Fetch all env_vars for this user via API
        const envRes = await fetch("/api/v1/env/bulk-update", {
          method: "GET",
        });

        // Note: bulk-update GET doesn't exist yet (Phase 3).
        // For now, fall back to direct Supabase client for env_vars fetch.
        // This will be fully migrated in Phase 3 (task 3.5 / 3.6).
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: envVars, error: envError } = await supabase
          .from("env_vars")
          .select("id, iv, ciphertext");

        if (envError) throw envError;

        // 5. Re-encrypt each env_var with new key
        const updates = await Promise.all(
          (envVars || []).map(async (v) => {
            const plaintext = await decrypt(v.iv, v.ciphertext, oldKey);
            const { iv, ciphertext } = await encrypt(plaintext, newKey);
            return { id: v.id, iv, ciphertext };
          }),
        );

        // 6. Create new test_ciphertext with new key
        const { iv: newTestIv, ciphertext: newTestCiphertext } = await encrypt(
          "UNLOCK_OK",
          newKey,
        );

        // 7. Batch update all env_vars
        // TODO: Replace with PUT /api/v1/env/bulk-update in Phase 3
        if (updates.length > 0) {
          for (const update of updates) {
            const { error: updateError } = await supabase
              .from("env_vars")
              .update({ iv: update.iv, ciphertext: update.ciphertext })
              .eq("id", update.id);

            if (updateError) throw updateError;
          }
        }

        // 8. Update profile with new test values via API
        await updatePassphrase(newTestIv, newTestCiphertext);

        // 9. Update in-memory key
        setCryptoKey(newKey);
        setIsUnlocked(true);

        toast.success("Passphrase changed successfully");
      } catch (err) {
        console.error("Change passphrase failed:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to change passphrase",
        );
        throw err;
      }
    },
    [],
  );

  // Query profile on mount to detect passphrase setup status
  useEffect(() => {
    const checkPassphraseSetup = async () => {
      try {
        setIsLoading(true);
        const profile = await fetchProfile();
        setIsPassphraseSetup(profile.has_passphrase);
      } catch (err) {
        console.error("Error checking passphrase setup:", err);
        toast.error("Failed to check passphrase setup status");
      } finally {
        setIsLoading(false);
      }
    };

    checkPassphraseSetup();
  }, []);

  // Auto-lock on window blur / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isUnlocked) {
        lock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isUnlocked, lock]);

  // Auto-lock after 30 minutes of inactivity
  useEffect(() => {
    if (!isUnlocked) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          lock();
        },
        30 * 60 * 1000,
      ); // 30 minutes
    };

    // Reset timer on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start initial timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isUnlocked, lock]);

  return (
    <SecretContext.Provider
      value={{
        cryptoKey,
        isUnlocked,
        isPassphraseSetup,
        isLoading,
        unlock,
        lock,
        changePassphrase,
      }}
    >
      {children}
    </SecretContext.Provider>
  );
}

export function useSecrets() {
  const context = useContext(SecretContext);
  if (context === undefined) {
    throw new Error("useSecrets must be used within a SecretProvider");
  }
  return context;
}
