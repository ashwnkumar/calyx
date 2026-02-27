# Secret Context Pattern – Calyx

## Goal
Provide a simple, dependency-free way to manage the in-memory cryptographic state (derived AES key + unlocked flag) using **React Context** only.  
This state should:
- Live purely in memory (lost on tab close / refresh / component unmount)
- Be accessible anywhere in the protected dashboard area
- Never persist decrypted material to localStorage / IndexedDB / cookies

## Recommended Implementation (lib/contexts/SecretContext.tsx)

```tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { deriveKey, encrypt, decrypt } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type SecretState = {
  cryptoKey: CryptoKey | null;
  isUnlocked: boolean;
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

  const unlock = useCallback(async (passphrase: string) => {
    try {
      const supabase = createClient(); // browser client

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('encryption_salt, test_iv, test_ciphertext')
        .single();

      if (error) throw error;
      if (!profile?.encryption_salt) throw new Error('No encryption salt found');

      // Derive AES key from passphrase + salt
      const key = await deriveKey(passphrase, profile.encryption_salt);

      // Verify passphrase correctness if test value exists
      if (profile.test_iv && profile.test_ciphertext) {
        const decryptedTest = await decrypt(
          profile.test_iv,
          profile.test_ciphertext,
          key
        );

        if (decryptedTest !== 'UNLOCK_OK') {
          throw new Error('Incorrect passphrase');
        }
      }

      // Success → store key in memory
      setCryptoKey(key);
      setIsUnlocked(true);

      // If this is first unlock (no test yet) → create verification blob
      if (!profile.test_ciphertext) {
        const { iv, ciphertext } = await encrypt('UNLOCK_OK', key);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            test_iv: iv,
            test_ciphertext: ciphertext,
          })
          .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (updateError) throw updateError;

        toast.success('Passphrase protection set up successfully');
      }

      toast.success('Secrets unlocked');
    } catch (err: any) {
      console.error('Unlock failed:', err);
      toast.error(err.message || 'Incorrect passphrase – please try again');
      throw err; // let caller handle if needed
    }
  }, []);

  const lock = useCallback(() => {
    setCryptoKey(null);
    setIsUnlocked(false);
    toast.info('Secrets locked');
  }, []);

  // Optional: auto-lock on window blur / visibility change (can be toggled off)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isUnlocked) {
        lock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUnlocked, lock]);

  return (
    <SecretContext.Provider value={{ cryptoKey, isUnlocked, unlock, lock }}>
      {children}
    </SecretContext.Provider>
  );
}

export function useSecrets() {
  const context = useContext(SecretContext);
  if (context === undefined) {
    throw new Error('useSecrets must be used within a SecretProvider');
  }
  return context;
}