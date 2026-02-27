# Calyx Project Overview

Calyx is a personal, single-user, zero-knowledge secrets manager for environment variables.
Purpose: Securely store project .env files so the developer (Ashwin) can access them cross-device without plaintext ever reaching the server.

Core properties:
- Zero-knowledge: Supabase stores **only encrypted values** (AES-GCM).
- Client-side encryption/decryption via Web Crypto API (AES-GCM-256 + PBKDF2).
- Passphrase-derived key — held **in-memory only** (via React Context, never persisted).
- Supabase for auth + storage (Postgres with RLS).
- Next.js 15 App Router, TypeScript, Tailwind + shadcn/ui.
- Single user — no multi-tenancy.

Key user flow:
1. Supabase login
2. Dashboard → projects list
3. Select project → encrypted env vars shown as locked/masked
4. Enter master passphrase → derive key in browser → decrypt → view/copy/download
5. Explicit "Lock" button + auto-lock after ~30 min inactivity
6. Refresh/tab close → locked again (key lost from memory)

State management rule:
- Use **React Context** (with useReducer or useState) for global in-memory state:
  - cryptoKey: CryptoKey | null
  - isUnlocked: boolean
- No external state libraries (no Zustand, no Jotai, no Redux).

Data access rule:
- Use **only Supabase client queries** (@supabase/ssr or supabase-js).
- No ORMs (no Drizzle, no Prisma, no TypeORM).
- Prefer Server Actions for mutations where possible.

Non-goals: team features, server injection, mobile native.