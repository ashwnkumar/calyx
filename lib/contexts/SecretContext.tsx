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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type SecretState = {
  cryptoKey: CryptoKey | null;
  isUnlocked: boolean;
  isPassphraseSetup: boolean;
  isLoading: boolean;
};

type SecretActions = {
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
};

type SecretContextValue = SecretState & SecretActions;

const SecretContext = createContext<SecretContextValue | undefined>(undefined);

export function SecretProvider({ children }: { children: ReactNode }) {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPassphraseSetup, setIsPassphraseSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unlock = useCallback(async (passphrase: string) => {
    try {
      const supabase = createClient();

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("encryption_salt, test_iv, test_ciphertext")
        .single();

      if (error) throw error;
      if (!profile?.encryption_salt)
        throw new Error("No encryption salt found");

      // Derive AES key from passphrase + salt
      const key = await deriveKey(passphrase, profile.encryption_salt);

      // Verify passphrase correctness if test value exists
      if (profile.test_iv && profile.test_ciphertext) {
        const decryptedTest = await decrypt(
          profile.test_iv,
          profile.test_ciphertext,
          key,
        );

        if (decryptedTest !== "UNLOCK_OK") {
          throw new Error("Incorrect passphrase");
        }
      }

      // Success → store key in memory
      setCryptoKey(key);
      setIsUnlocked(true);

      // If this is first unlock (no test yet) → create verification blob
      if (!profile.test_ciphertext) {
        const { iv, ciphertext } = await encrypt("UNLOCK_OK", key);
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            test_iv: iv,
            test_ciphertext: ciphertext,
          })
          .eq("id", (await supabase.auth.getUser()).data.user?.id);

        if (updateError) throw updateError;

        // Update isPassphraseSetup since we just created test_ciphertext
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

  // Query profile on mount to detect passphrase setup status
  useEffect(() => {
    const checkPassphraseSetup = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("encryption_salt, test_iv, test_ciphertext")
          .single();

        if (error) {
          console.error("Failed to query profile:", error);
          toast.error("Failed to load profile data");
          return;
        }

        // Set isPassphraseSetup based on test_ciphertext existence
        setIsPassphraseSetup(!!profile?.test_ciphertext);
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
