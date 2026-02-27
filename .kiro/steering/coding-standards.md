# Coding Standards – Calyx

## General
- TypeScript strict
- Functional components + hooks
- Server Actions for mutations (add/edit/delete project/env)
- Client components for crypto logic, unlock modal, context consumers
- Error handling: try/catch + toast (sonner)
- No console exposure of secrets

## State Management
- Use **React Context** for the following global in-memory state only:
  - cryptoKey (CryptoKey | null)
  - isUnlocked (boolean)
  - unlock/lock functions
- Create one Context: `SecretContext` (or `CryptoContext`)
- Provider: `SecretProvider` wrapping protected routes/layout
- Custom hook: `useSecrets()` for consumption
- Do NOT use Context for: auth session (use Supabase auth helpers), projects/env lists (use React Query or SWR if caching needed, or just local state + refetch)

## Data Access
- Supabase queries only — examples:
  ```ts
  const { data } = await supabase.from('env_vars').select('id,key,iv,ciphertext').eq('project_id', projectId);