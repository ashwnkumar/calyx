# API Migration Plan — Server Actions → REST Endpoints

> Calyx backend migration from Next.js Server Actions to versioned REST API (`/api/v1/`).
> Enables: VSCode extension consumption, future team flow, rate limiting, proper HTTP semantics.

---

## Current State Inventory

### Server Action Files (to be replaced)

| File                                              | Exported Functions                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app/(app)/actions.ts`                            | `createProject`, `deleteProject`, `updateProjectName`, `updateProjectDescription`              |
| `app/(app)/projects/[id]/actions.ts`              | `addEnvFile`, `deleteEnvFiles`, `getEnvVarHistory`, `getEnvVarVersion`, `restoreEnvVarVersion` |
| `app/(app)/projects/[id]/env/[fileId]/actions.ts` | `updateEnvFile`, `updateEnvFileName`                                                           |

### Direct Supabase Queries in Pages (reads to migrate)

| File                                                    | What it fetches                      |
| ------------------------------------------------------- | ------------------------------------ |
| `app/(app)/dashboard/page.tsx`                          | List projects with env_vars count    |
| `app/(app)/projects/[id]/page.tsx`                      | Single project + its env files       |
| `app/(app)/projects/[id]/env/[fileId]/page.tsx`         | Single project + single env file     |
| `app/(app)/projects/[id]/env/[fileId]/history/page.tsx` | Project + env file + version history |

### Direct Supabase Client Calls (client-side, to migrate)

| File                                                        | What it does                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `lib/contexts/SecretContext.tsx` → `unlock()`               | Reads `profiles` table, writes `test_iv`/`test_ciphertext` on first setup   |
| `lib/contexts/SecretContext.tsx` → `changePassphrase()`     | Reads profile + all env_vars, re-encrypts, batch updates env_vars + profile |
| `lib/contexts/SecretContext.tsx` → `checkPassphraseSetup()` | Reads profile to check if `test_ciphertext` exists                          |
| `components/env-variables/project-details-client.tsx`       | Client-side refetch of env files after mutations                            |

### Existing Route Handler (keep/refactor)

| File                         | Method | Purpose                       |
| ---------------------------- | ------ | ----------------------------- |
| `app/auth/callback/route.ts` | GET    | OAuth code → session exchange |

### Bugs to Fix During Migration

- `proxy.ts` exports `proxy()` instead of `middleware()` — middleware is not running
- No input validation on encrypted payloads (iv, ciphertext)
- No UUID validation on most server actions (only `projects/[id]/page.tsx` validates)
- `changePassphrase` is non-atomic (partial failure = mixed-key data)
- `updateProjectDescription` skips length validation
- Duplicate type definitions across action files

---

## Target API Surface

```
Auth (existing, keep as-is):
  GET  /auth/callback                              OAuth exchange

Profiles:
  GET  /api/v1/profile                             Get current user profile (salt, setup status)
  PUT  /api/v1/profile/passphrase                  Update test_iv + test_ciphertext (first setup or change)

Projects:
  GET  /api/v1/projects                            List all projects (with env count)
  POST /api/v1/projects                            Create project
  GET  /api/v1/projects/:id                        Get single project + env files
  PATCH /api/v1/projects/:id                       Update project name/description
  DELETE /api/v1/projects/:id                      Delete project (cascade)

Env Files:
  POST   /api/v1/projects/:id/env                  Add encrypted env file
  PATCH  /api/v1/projects/:id/env/:fileId          Update env file content (iv + ciphertext)
  PATCH  /api/v1/projects/:id/env/:fileId/name     Rename env file
  DELETE /api/v1/projects/:id/env                   Batch delete env files (body: { ids: [] })

Versions:
  GET  /api/v1/env/:envVarId/versions              List version history
  GET  /api/v1/env/:envVarId/versions/:versionId   Get specific version
  POST /api/v1/env/:envVarId/versions/:versionId/restore   Restore to version

Bulk (for passphrase change):
  PUT  /api/v1/env/bulk-update                     Batch update iv+ciphertext for multiple env_vars
```

---

## Phase 0 — Foundation & Shared Infrastructure

> Set up the plumbing that every route will use.

- [x] **0.1** Fix middleware: rename `proxy.ts` → `middleware.ts`, export function as `middleware` (not `proxy`)
- [x] **0.2** Create shared API types file: `lib/types/api.ts`
  - `ApiResponse<T>` (replaces per-file `ActionResult<T>`)
  - `Project`, `EnvFile`, `EnvVarVersion`, `Profile` types
  - HTTP error type with status code
- [x] **0.3** Create API auth helper: `lib/api/auth.ts`
  - `authenticateRequest(request: NextRequest)` → returns `{ user, supabase }` or throws 401
  - Centralizes the repeated `getUser()` + null check pattern
- [x] **0.4** Create API response helpers: `lib/api/response.ts`
  - `success(data, status?)` → `NextResponse.json({ success: true, data }, { status })`
  - `error(message, status)` → `NextResponse.json({ success: false, error }, { status })`
- [x] **0.5** Create input validation helpers: `lib/api/validation.ts`
  - `validateUUID(value, fieldName)` → throws 400 if invalid
  - `validateBase64(value, fieldName, expectedByteLength?)` → validates iv/ciphertext format
  - `validateRequiredString(value, fieldName, maxLength?)` → trims + validates
- [x] **0.6** Create rate limiter utility: `lib/api/rate-limit.ts`
  - In-memory token bucket (good enough for single-instance; swap to Redis later for team)
  - `rateLimit(identifier, { maxRequests, windowMs })` → returns `{ allowed, remaining, resetAt }`
- [x] **0.7** Create API middleware wrapper: `lib/api/with-auth.ts`
  - Higher-order function that wraps route handlers with auth + rate limiting + error handling
  - Catches thrown errors and maps to proper HTTP status codes
  - Adds standard security headers (`X-Content-Type-Options`, `Cache-Control: no-store`)

---

## Phase 1 — Profile Endpoints

> Migrate SecretContext's direct Supabase calls to API routes.

- [x] **1.1** `GET /api/v1/profile` → `app/api/v1/profile/route.ts`
  - Returns `{ encryption_salt, has_passphrase: boolean }` (never expose test_iv/test_ciphertext raw)
  - Replaces: `SecretContext.checkPassphraseSetup()` direct query
  - Replaces: `SecretContext.unlock()` profile fetch
- [x] **1.2** `PUT /api/v1/profile/passphrase` → `app/api/v1/profile/passphrase/route.ts`
  - Body: `{ test_iv, test_ciphertext }`
  - Validates base64 format of iv (16 chars / 12 bytes) and ciphertext (non-empty)
  - Replaces: the `profiles.update()` call inside `SecretContext.unlock()` (first-time setup)
  - Replaces: the profile update inside `SecretContext.changePassphrase()`
- [x] **1.3** Update `SecretContext.tsx` to call API routes instead of direct Supabase
  - `unlock()` → `fetch('/api/v1/profile')` then client-side crypto, then `fetch PUT /api/v1/profile/passphrase')` if first setup
  - `checkPassphraseSetup()` → `fetch('/api/v1/profile')`
  - Keep `lock()` as-is (pure client state)
- [x] **1.4** Add rate limiting to profile endpoints (stricter on PUT — 10 req/min)

---

## Phase 2 — Project Endpoints

> Migrate project CRUD from server actions to REST.

- [ ] **2.1** `GET /api/v1/projects` → `app/api/v1/projects/route.ts`
  - Returns projects with `env_vars` count, ordered by `updated_at` desc
  - Replaces: direct query in `dashboard/page.tsx`
- [ ] **2.2** `POST /api/v1/projects` → same route file, POST handler
  - Body: `{ name, description? }`
  - Uses `validateProjectData()` (existing validator)
  - Duplicate name check
  - Replaces: `createProject()` server action
- [ ] **2.3** `GET /api/v1/projects/:id` → `app/api/v1/projects/[id]/route.ts`
  - Returns project + env files list
  - UUID validation on `:id`
  - Replaces: direct queries in `projects/[id]/page.tsx`
- [ ] **2.4** `PATCH /api/v1/projects/:id` → same route file, PATCH handler
  - Body: `{ name?, description? }` (partial update)
  - Validates name length, description length, duplicate name check
  - Replaces: `updateProjectName()` + `updateProjectDescription()` server actions
- [ ] **2.5** `DELETE /api/v1/projects/:id` → same route file, DELETE handler
  - Ownership verification before delete
  - Replaces: `deleteProject()` server action
- [ ] **2.6** Update `dashboard/page.tsx` to fetch from API (server-side fetch with cookie forwarding)
- [ ] **2.7** Update `projects/[id]/page.tsx` to fetch from API
- [ ] **2.8** Update client components that call project server actions to use `fetch()`
- [ ] **2.9** Delete `app/(app)/actions.ts` once all callers are migrated

---

## Phase 3 — Env File Endpoints

> Migrate env file CRUD.

- [ ] **3.1** `POST /api/v1/projects/:id/env` → `app/api/v1/projects/[id]/env/route.ts`
  - Body: `{ name, iv, ciphertext }`
  - Validates: UUID project ID, base64 iv (12 bytes), non-empty ciphertext, name length
  - Project ownership check
  - Replaces: `addEnvFile()` server action
- [ ] **3.2** `DELETE /api/v1/projects/:id/env` → same route file, DELETE handler
  - Body: `{ ids: string[] }`
  - Validates: each ID is UUID, array not empty, max batch size (e.g. 50)
  - Replaces: `deleteEnvFiles()` server action
- [ ] **3.3** `PATCH /api/v1/projects/:id/env/:fileId` → `app/api/v1/projects/[id]/env/[fileId]/route.ts`
  - Body: `{ iv, ciphertext }`
  - Validates base64 iv, non-empty ciphertext
  - Replaces: `updateEnvFile()` server action
- [ ] **3.4** `PATCH /api/v1/projects/:id/env/:fileId/name` → `app/api/v1/projects/[id]/env/[fileId]/name/route.ts`
  - Body: `{ name }`
  - Validates name length, duplicate check
  - Replaces: `updateEnvFileName()` server action
- [ ] **3.5** `PUT /api/v1/env/bulk-update` → `app/api/v1/env/bulk-update/route.ts`
  - Body: `{ updates: [{ id, iv, ciphertext }] }`
  - Validates each entry, max batch size
  - Executes all updates (ideally in a transaction via Supabase RPC if available)
  - Replaces: the `for` loop in `SecretContext.changePassphrase()`
  - Fixes the non-atomic update bug
- [ ] **3.6** Update `SecretContext.changePassphrase()` to use bulk-update + profile passphrase endpoints
- [ ] **3.7** Update `project-details-client.tsx` to fetch env files via API instead of direct Supabase
- [ ] **3.8** Update page components that call env file server actions to use `fetch()`
- [ ] **3.9** Delete `app/(app)/projects/[id]/actions.ts` once all callers are migrated
- [ ] **3.10** Delete `app/(app)/projects/[id]/env/[fileId]/actions.ts` once all callers are migrated

---

## Phase 4 — Version History Endpoints

> Migrate version history reads + restore.

- [ ] **4.1** `GET /api/v1/env/:envVarId/versions` → `app/api/v1/env/[envVarId]/versions/route.ts`
  - UUID validation on envVarId
  - Returns version list ordered by version_number desc
  - Replaces: `getEnvVarHistory()` server action
- [ ] **4.2** `GET /api/v1/env/:envVarId/versions/:versionId` → `app/api/v1/env/[envVarId]/versions/[versionId]/route.ts`
  - UUID validation on both params
  - Replaces: `getEnvVarVersion()` server action
- [ ] **4.3** `POST /api/v1/env/:envVarId/versions/:versionId/restore` → `app/api/v1/env/[envVarId]/versions/[versionId]/restore/route.ts`
  - Validates version belongs to env_var
  - Replaces: `restoreEnvVarVersion()` server action
- [ ] **4.4** Update history page + any client components to use API
- [ ] **4.5** Verify all version-related server action callers are migrated

---

## Phase 5 — Security Hardening

> Add the security layers that server actions couldn't support.

- [ ] **5.1** Apply rate limiting to all endpoints via the `with-auth` wrapper
  - Read endpoints: 60 req/min
  - Write endpoints: 30 req/min
  - Profile/passphrase: 10 req/min (brute-force protection)
  - Bulk update: 5 req/min
- [ ] **5.2** Add request body size limits
  - General: 100KB max
  - Bulk update: 1MB max (many env files)
  - Reject oversized payloads with 413
- [ ] **5.3** Add CORS configuration for API routes
  - Allow only the app's own origin for now
  - Will expand for VSCode extension origin later
- [ ] **5.4** Add security headers to all API responses
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: no-store` (sensitive data)
  - `X-Frame-Options: DENY`
- [ ] **5.5** Sanitize error responses — never leak Supabase/Postgres error details to client
- [ ] **5.6** Add request ID generation for traceability (optional, `X-Request-Id` header)
- [ ] **5.7** Audit `console.error` calls — replace with structured logging or remove in production

---

## Phase 6 — Client Integration & Cleanup

> Wire the web app to the new API and remove dead code.

- [ ] **6.1** Create API client utility: `lib/api/client.ts`
  - Typed `fetch` wrapper with error handling, auth header forwarding, response parsing
  - Used by both client components and server components (with cookie forwarding)
- [ ] **6.2** Update all page-level server components to fetch via API client (with cookie passthrough)
- [ ] **6.3** Update all client components to use API client instead of server actions
- [ ] **6.4** Remove `SecretContext` direct Supabase imports — should only use API + client-side crypto
- [ ] **6.5** Delete all old server action files:
  - `app/(app)/actions.ts`
  - `app/(app)/projects/[id]/actions.ts`
  - `app/(app)/projects/[id]/env/[fileId]/actions.ts`
- [ ] **6.6** Remove `lib/supabase/client.ts` browser client if no longer needed (all client calls go through API)
  - Note: keep if SecretContext still needs it for profile reads during unlock (evaluate)
- [ ] **6.7** Run full app smoke test — every CRUD flow, unlock/lock, passphrase change, version restore
- [ ] **6.8** Verify `revalidatePath` / `revalidateTag` still works for Next.js cache invalidation
  - API routes can still call `revalidatePath()` since they run server-side
  - Alternatively, switch to `revalidateTag` for more granular control

---

## File Structure After Migration

```
app/
  api/
    v1/
      profile/
        route.ts                    GET profile
        passphrase/
          route.ts                  PUT passphrase setup/change
      projects/
        route.ts                    GET list, POST create
        [id]/
          route.ts                  GET detail, PATCH update, DELETE
          env/
            route.ts                POST add, DELETE batch
            [fileId]/
              route.ts              PATCH update content
              name/
                route.ts            PATCH rename
      env/
        bulk-update/
          route.ts                  PUT batch re-encrypt
        [envVarId]/
          versions/
            route.ts                GET list versions
            [versionId]/
              route.ts              GET single version
              restore/
                route.ts            POST restore
  auth/
    callback/
      route.ts                      (existing, unchanged)

lib/
  api/
    auth.ts                         Auth helper
    response.ts                     Response helpers
    validation.ts                   Input validators
    rate-limit.ts                   Rate limiter
    with-auth.ts                    Route wrapper (auth + rate limit + error handling)
    client.ts                       Typed fetch wrapper for consuming API
  types/
    api.ts                          Shared types
```

---

## Migration Rules

1. One phase at a time. Don't start Phase N+1 until Phase N is fully checked off.
2. Each endpoint should be testable independently (curl/Postman) before wiring up the UI.
3. Keep server actions alive until their replacement endpoint + UI integration is verified. Delete only in Phase 6.
4. Every route handler must go through the `with-auth` wrapper — no raw route handlers.
5. Never return raw Supabase errors to the client. Map to user-friendly messages.
6. All UUID params validated before any DB query.
7. All base64 fields (iv, ciphertext) validated for format before DB write.
