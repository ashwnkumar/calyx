# Architecture Decisions – Calyx

## 1. Client-side encryption only
Zero-knowledge — Supabase sees only ciphertext.

## 2. Passphrase verification via test ciphertext
Encrypted "UNLOCK_OK" stored in profiles.test_ciphertext + test_iv.
Decrypt on unlock → must match → confirm correct passphrase.

## 3. React Context instead of Zustand
Chosen because: zero dependencies, sufficient for simple global in-memory state (cryptoKey + isUnlocked).
Key lives only in Context value → lost on remount/refresh.
Rejected Zustand because: we want to minimize external libs for this small personal tool.

## 4. No ORM — pure Supabase queries
Use supabase.from().select()/upsert()/update() directly.
Reason: simpler mental model, fewer abstractions, full control over queries.

## 5. In-memory key only (no persistence)
No localStorage/sessionStorage for key material.
Context Provider placed high in tree (e.g. in dashboard layout).