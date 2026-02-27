# Crypto & Security Conventions – Calyx

- AES-GCM 256-bit
- PBKDF2-SHA256, 350_000 iterations (adjustable 300k–600k)
- Salt: 16 random bytes → base64
- IV: 12 random bytes per encryption → base64
- Key derivation: crypto.subtle.deriveKey (non-extractable)
- Encrypt/decrypt helpers in lib/crypto.ts
- Test string: exactly "UNLOCK_OK" (no extra whitespace)
- Never reuse IV
- Handle decryption errors gracefully → "Incorrect passphrase"
- In-memory only: Zustand store.cryptoKey: CryptoKey | null
- Lock clears: setCryptoKey(null), isUnlocked=false