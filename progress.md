# Calyx Development Progress

## Project Overview

**Calyx** is a personal, single-user, zero-knowledge secrets manager for environment variables. It enables secure storage of project .env files with client-side encryption, ensuring plaintext never reaches the server.

**Core Technologies:**

- Next.js 15 App Router with TypeScript
- Supabase (Auth + Postgres with RLS)
- Web Crypto API (AES-GCM-256 + PBKDF2)
- Tailwind CSS + shadcn/ui components
- React Context for in-memory state management

**Key Principles:**

- Zero-knowledge architecture (server stores only encrypted values)
- Passphrase-derived key held in-memory only (via React Context)
- Client-side encryption/decryption
- Single-user focused (no multi-tenancy)

**State Management:** React Context only (no Zustand/Redux)  
**Data Access:** Pure Supabase queries (no ORMs)

---

## Development Log

### 2026-02-27 - Project Initialization & Foundation Setup

**Core Infrastructure:**

- Initialized Next.js 15 project with App Router architecture
- Configured TypeScript strict mode and ESLint
- Set up Tailwind CSS v4 with custom configuration
- Integrated shadcn/ui component library (components.json configured)

**Authentication & Layout:**

- Implemented Supabase authentication integration (@supabase/ssr)
- Created protected app layout (`app/(app)/layout.tsx`) with auth guard
- Built auth layout (`app/(auth)/layout.tsx`) for login flow
- Added login page with form component (`app/(auth)/login/page.tsx`)
- Created `AppHeader` and `AppFooter` components for consistent layout
- Implemented `AuthButton` and `LogoutButton` for auth controls
- Added theme switcher with next-themes integration

**Cryptography Foundation:**

- Implemented `lib/crypto.ts` with Web Crypto API utilities:
  - AES-GCM-256 encryption/decryption
  - PBKDF2-SHA256 key derivation (350k iterations)
  - Salt generation (16 bytes)
  - IV generation (12 bytes per encryption)
- Created `SecretContext` (`lib/contexts/SecretContext.tsx`):
  - In-memory cryptoKey storage (CryptoKey | null)
  - Unlock/lock functionality with passphrase verification
  - Auto-lock on visibility change
  - Test ciphertext validation ("UNLOCK_OK")

**Project Management UI:**

- Built project listing page (`app/(app)/page.tsx`)
- Created `ProjectListingClient` component with state management
- Implemented `ProjectGrid` for displaying project cards
- Added `ProjectCard` component with project details
- Created `AddProjectDialog` for new project creation
- Built `EmptyState` component for zero-projects view
- Added `ErrorState` component for error handling
- Implemented `ProjectGridSkeleton` for loading states

**shadcn/ui Components Integrated:**

- Button, Card, Badge
- Dialog, Dropdown Menu
- Input, Label, Textarea
- Checkbox, Password Input
- Skeleton (loading states)
- Sonner (toast notifications)

**Supabase Integration:**

- Set up client-side Supabase client (`lib/supabase/client.ts`)
- Configured server-side Supabase client (`lib/supabase/server.ts`)
- Added Supabase proxy utilities (`lib/supabase/proxy.ts`)

**Project Structure:**

- Established route groups: `(app)` for protected routes, `(auth)` for public auth
- Created organized component structure: `components/projects/`, `components/ui/`
- Set up validation utilities (`lib/validations/project.ts`)
- Configured environment variables (.env.example provided)

**Documentation:**

- Created comprehensive steering files in `.kiro/steering/`:
  - `project-overview.md` - Project goals and maintenance guidelines
  - `architecture-decisions.md` - Key architectural choices
  - `coding-standards.md` - TypeScript and React conventions
  - `crypto-conventions.md` - Cryptography implementation details
  - `secret-context-pattern.md` - React Context usage pattern
  - `supabase-schema.md` - Database schema reference

**Spec-Driven Development:**

- Initialized spec workflow in `.kiro/specs/project-listing-page/`
- Created requirements, design, and tasks documents for project listing feature

---

## Quick Status Summary

| Area                  | Status      | Notes                                    |
| --------------------- | ----------- | ---------------------------------------- |
| Authentication        | ✅ Complete | Supabase auth with protected routes      |
| Crypto Foundation     | ✅ Complete | AES-GCM + PBKDF2 implementation          |
| SecretContext         | ✅ Complete | In-memory key + passphrase detection     |
| Project Listing       | ✅ Complete | Grid view with CRUD operations           |
| Project Detail View   | ✅ Complete | View/edit env vars per project           |
| Environment Variables | ✅ Complete | Encrypted storage with .env parsing      |
| Passphrase Setup      | ✅ Complete | First-time setup with security warnings  |
| Unlock/Lock UI        | ✅ Complete | Modal dialogs + persistent status banner |
| UI Components         | ✅ Complete | shadcn/ui integrated throughout          |

---

_This file is automatically maintained as development progresses. Each significant milestone or feature implementation is logged with date, description, and affected files._

### 2026-02-27 - Project Details Page Implementation

**Project Detail View:**

- Created project details page (`app/(app)/projects/[id]/page.tsx`)
- Implemented UUID validation for project IDs
- Added RLS-enforced project metadata fetching
- Built error handling for invalid/unauthorized project access

**Environment Variables UI:**

- Created `ProjectDetailsClient` component (`components/env-variables/project-details-client.tsx`):
  - Integrated SecretContext for lock state management
  - Implemented dialog state management for add/edit flows
  - Added optimistic updates for env vars
  - Built refetch mechanism for data consistency
- Implemented `EnvVariableGrid` component for displaying encrypted variables
- Created `EnvVariableCard` component with decrypt/copy/edit/delete actions
- Built `AddEnvDialog` for adding new environment variables with .env parsing
- Added `EmptyState` component for zero-variables view
- Created `LockIndicator` component showing lock status

**Environment Variable Parsing:**

- Implemented `.env` file parser (`lib/parsers/env-parser.ts`):
  - Supports KEY=VALUE format
  - Handles quoted values (single/double quotes)
  - Strips inline comments
  - Validates variable names
- Added comprehensive test suite (`lib/parsers/env-parser.test.ts`)
- Created validation schemas (`lib/validations/env-variable.ts`)

**Server Actions:**

- Implemented `addEnvVariables` action (`app/(app)/projects/[id]/actions.ts`):
  - Bulk insert support for parsed .env files
  - Client-side encryption before storage
  - Transaction-safe batch operations

**shadcn/ui Components Added:**

- Alert component for lock indicator
- Enhanced dialog components for env variable management

**Spec-Driven Development:**

- Created spec workflow in `.kiro/specs/project-details-page/`
- Documented requirements, design, and implementation tasks
- Completed all core tasks for project details view

**Status Update:**

- Project Detail View: ✅ Complete (structure and data fetching)
- Environment Variables: ✅ Complete (display, add, edit, delete with encryption)
- Unlock Modal: ⏳ Next Priority (passphrase entry UI missing)

**Known Gap:**

- Unlock dialog/modal not yet implemented - users see "Secrets Locked" alert but cannot unlock
- First-time passphrase setup flow needs UI implementation

### 2026-02-27 - Passphrase Setup & Unlock UI Implementation

**Passphrase Management System:**

- Enhanced `SecretContext` (`lib/contexts/SecretContext.tsx`):
  - Added `isPassphraseSetup` state detection via profiles.test_ciphertext query
  - Added `isLoading` state for async profile operations
  - Implemented automatic passphrase setup detection on mount
  - Maintained existing unlock/lock functionality with test ciphertext verification
- Created passphrase validation utilities (`lib/passphrase-validation.ts`):
  - `validatePassphrase()` - enforces 12-character minimum
  - `validateConfirmPassphrase()` - ensures passphrase match
  - `handleUnlockError()` - user-friendly error messages

**Setup Dialog:**

- Built `SetupDialog` component (`components/setup-dialog.tsx`):
  - First-time passphrase creation with confirmation field
  - Security warnings (encrypts all secrets, no recovery, never leaves browser)
  - Real-time validation with error messages
  - Show/hide password toggles for both fields
  - Loading states during submission
  - Proper ARIA attributes for accessibility
  - Form state management with error handling

**Unlock Dialog:**

- Created `UnlockDialog` component (`components/unlock-dialog.tsx`):
  - Passphrase entry for returning users
  - Show/hide password toggle
  - Error display with retry capability
  - Auto-focus on passphrase input
  - Loading states during unlock
  - Proper ARIA attributes for accessibility

**Status Alert Banner:**

- Implemented `PassphraseStatusAlert` component (`components/passphrase-status-alert.tsx`):
  - Three states: Setup Prompt, Locked, Unlocked
  - Conditional rendering based on isPassphraseSetup and isUnlocked
  - Action buttons: "Set Up Passphrase", "Unlock", "Lock"
  - Visual indicators with icons (Key, Lock, LockOpen)
  - Green styling for unlocked state
- Integrated alert into app layout (`app/(app)/layout.tsx`):
  - Placed above main content for visibility
  - Persists across all dashboard pages
  - Wrapped by SecretProvider for context access

**UI Components:**

- Leveraged shadcn/ui Dialog primitives (Radix UI):
  - Automatic keyboard navigation (Tab, Enter, Escape)
  - Focus trap and focus restoration
  - Overlay and portal management
- Used PasswordInput component with show/hide toggle
- Applied Alert component for status banner and warnings

**Security Verification:**

- ✅ No passphrase logging to console
- ✅ No localStorage/sessionStorage persistence
- ✅ Passphrase only passed to SecretContext.unlock()
- ✅ Client-side only processing (zero-knowledge maintained)
- ✅ Proper error handling without exposing sensitive data

**Accessibility Features:**

- ✅ Auto-focus on first input field when dialogs open
- ✅ Keyboard navigation (Tab, Enter, Escape) via Radix UI
- ✅ ARIA attributes (aria-describedby, aria-invalid, aria-label)
- ✅ Associated labels with inputs (htmlFor)
- ✅ Screen reader support for error messages

**Build & Validation:**

- ✅ TypeScript compilation successful (no errors)
- ✅ Next.js production build successful
- ✅ All diagnostics clean across implementation files
- ✅ Requirements validation complete (8 requirement categories)

**Spec-Driven Development:**

- Completed spec workflow in `.kiro/specs/passphrase-setup-unlock-ui/`
- Implemented all core tasks (1-6) from implementation plan
- Optional test tasks (marked with \*) deferred (no test framework configured)
- Final checkpoint (task 9) completed with comprehensive verification

**Status Update:**

- Passphrase Setup: ✅ Complete (first-time setup with warnings)
- Unlock Modal: ✅ Complete (returning user unlock flow)
- Lock Functionality: ✅ Complete (manual lock + auto-lock on visibility change)
- Status Indicator: ✅ Complete (persistent alert banner across dashboard)

**Known Gaps:**

- No automated test suite (Jest/React Testing Library not configured)
- Property-based tests not implemented (fast-check not installed)
- Manual testing required for full validation

### 2026-02-27 - Time-Based Auto-Lock Enhancement

**Auto-Lock Improvements:**

- Enhanced `SecretContext` (`lib/contexts/SecretContext.tsx`):
  - Added 30-minute inactivity timer for automatic secret locking
  - Implemented activity detection for mouse, keyboard, scroll, and touch events
  - Timer resets on any user interaction to prevent premature locking
  - Proper cleanup of event listeners and timers on unmount

**Auto-Lock Behavior:**

- **Visibility-based**: Locks immediately when tab is hidden or window is minimized
- **Time-based**: Locks after 30 minutes of inactivity (new)
- **Activity tracking**: Monitors mousedown, keydown, scroll, and touchstart events
- **Timer reset**: Any user activity resets the 30-minute countdown

**Security Enhancement:**

- Ensures secrets don't remain unlocked indefinitely in idle sessions
- Complements existing visibility-based auto-lock for comprehensive protection
- Maintains zero-knowledge architecture with in-memory key management

### 2026-02-28 - Environment Variable View & Download (Locked State)

**Locked State Viewing & Download:**

- Enhanced `EnvVariableCard` component (`components/env-variables/env-variable-card.tsx`):
  - Added conditional rendering for locked vs unlocked states
  - Display encrypted ciphertext in monospace font with muted styling when locked
  - Show lock/unlock icons in card header based on state
  - Added copy button for encrypted values (clipboard API with fallback)
  - Added download button for single encrypted variable (JSON format)
  - Implemented base64 validation with error state display
  - Disabled buttons when encrypted data format is invalid
- Created download utilities (`lib/download-utils.ts`):
  - `sanitizeFilename()` - produces safe filenames from project/env names
  - `downloadFile()` - triggers browser download using Blob API
  - `downloadSingleEncrypted()` - exports single env var as JSON
  - `downloadAllEncryptedJson()` - exports all env vars as JSON array
  - `downloadAllEncryptedEnv()` - exports in .env format (KEY=iv:ciphertext)
  - `isValidBase64()` - validates base64 encoding before operations
- Created clipboard utilities (`lib/clipboard-utils.ts`):
  - `copyToClipboard()` - uses Clipboard API with execCommand fallback
  - Handles permission denied and API unavailable scenarios
  - Toast notifications for success/failure feedback

**Bulk Download Controls:**

- Implemented `DownloadControls` component (`components/env-variables/download-controls.tsx`):
  - Two buttons: "Download All (Encrypted JSON)" and "Download All (Encrypted .env)"
  - Only visible when secrets are locked
  - Disabled when project has no environment variables
  - Toast notifications on success/error
- Integrated into `ProjectDetailsClient` page header next to "Add" button

**Visual Enhancements:**

- Enhanced `LockIndicator` component (`components/env-variables/lock-indicator.tsx`):
  - Shows both locked AND unlocked states with distinct styling
  - Unlocked: Green-themed alert with positive messaging
  - Locked: Standard alert with explanation about encrypted values
- Improved encrypted value display with subtle background container
- Updated button labels to clearly indicate "Encrypted" in locked state

**Security & Validation:**

- Verified state cleanup on lock transition (SecretContext clears cryptoKey)
- Added base64 validation before all copy/download operations
- Display error state in cards for invalid encrypted data
- No decryption attempts when isUnlocked === false
- Proper error handling without exposing sensitive data

**Empty State Handling:**

- Updated `EmptyState` component (`components/env-variables/empty-state.tsx`):
  - Conditional message based on lock state
  - Locked: "Unlock your secrets to add environment variables"
  - Unlocked: "Add your first environment variable to start managing secrets securely"
- Download buttons automatically disabled when project is empty

**Round-Trip Verification:**

- Created comprehensive test suite (`lib/download-utils.test.ts`):
  - 23 tests verifying all three download formats preserve data integrity
  - Tested single JSON, bulk JSON, and .env formats
  - Verified encryption → download → parse → decrypt cycle
  - Tested with special characters, Unicode, empty strings, long values
- Created encrypted .env parser (`lib/parsers/encrypted-env-parser.ts`):
  - Handles base64 padding correctly (splits only on first '=' character)
  - Validates base64 encoding before decryption
  - 18 comprehensive parser tests
- Created format specification (`docs/encrypted-env-format.md`):
  - Documents the KEY=iv:ciphertext format
  - Explains the base64 padding parsing issue
  - Provides usage examples and security considerations

**Files Created/Modified:**

- `lib/download-utils.ts` - Download utilities with validation
- `lib/clipboard-utils.ts` - Clipboard operations with fallback
- `components/env-variables/download-controls.tsx` - Bulk download UI
- `components/env-variables/env-variable-card.tsx` - Enhanced with locked state
- `components/env-variables/env-variable-grid.tsx` - Updated to pass projectName
- `components/env-variables/project-details-client.tsx` - Integrated DownloadControls
- `components/env-variables/lock-indicator.tsx` - Enhanced visual states
- `components/env-variables/empty-state.tsx` - Conditional messaging
- `lib/parsers/encrypted-env-parser.ts` - Parser for encrypted .env format
- `lib/parsers/encrypted-env-parser.test.ts` - 18 parser validation tests
- `lib/download-utils.test.ts` - 23 round-trip verification tests
- `docs/encrypted-env-format.md` - Format specification
- `docs/verification-summary-task-10.1.md` - Verification report

**Spec-Driven Development:**

- Completed spec workflow in `.kiro/specs/env-view-download-locked/`
- Implemented all required tasks (1-10) from implementation plan
- Optional test tasks (marked with \*) deferred
- Manual cross-browser testing deferred to user

**Status Update:**

- Locked State Viewing: ✅ Complete (display encrypted values with visual distinction)
- Copy Encrypted Values: ✅ Complete (clipboard API with fallback)
- Download Single Variable: ✅ Complete (JSON format with validation)
- Download All Variables: ✅ Complete (JSON and .env formats)
- Round-Trip Verification: ✅ Complete (41 tests passing)
- Security Safeguards: ✅ Complete (validation, state cleanup, no plaintext exposure)

**Key Achievement:**

- Users can now view and download encrypted environment variables without unlocking
- All three download formats (single JSON, bulk JSON, .env) preserve data integrity
- Zero-knowledge security maintained - no plaintext exposure in locked state

### 2026-02-28 - Environment Variable Delete Flow (Single & Multi-Select)

**Delete Functionality:**

- Added `deleteEnvVariables` server action (`app/(app)/projects/[id]/actions.ts`):
  - Bulk delete support for multiple environment variables
  - Authentication and ownership verification via RLS
  - Returns count of deleted records
  - Revalidates project page cache after deletion
- Enhanced `EnvVariableCard` component (`components/env-variables/env-variable-card.tsx`):
  - Added checkbox for selection mode
  - Visual feedback with ring border when selected
  - Integrated shadcn/ui Checkbox component
  - Props: `isSelected`, `onSelectionChange`, `selectionMode`
- Updated `EnvVariableGrid` component (`components/env-variables/env-variable-grid.tsx`):
  - Passes selection state and handlers to cards
  - Props: `selectedIds` (Set), `onSelectionChange`, `selectionMode`

**Selection Mode UI:**

- Enhanced `ProjectDetailsClient` component (`components/env-variables/project-details-client.tsx`):
  - Added selection mode toggle button ("Select" / "Cancel")
  - Implemented Select All / Deselect All functionality
  - Delete button shows count of selected items: "Delete (n)"
  - Selection state management with Set<string> for efficient lookups
  - Automatic exit from selection mode after successful deletion
  - Loading state during deletion (`isDeleting`)

**Confirmation Dialog:**

- Created shadcn/ui AlertDialog component (`components/ui/alert-dialog.tsx`):
  - Full Radix UI AlertDialog primitive wrapper
  - Includes overlay, content, header, footer, title, description
  - Action and cancel buttons with proper styling
  - Smooth animations and focus management
- Integrated AlertDialog into delete flow:
  - Contextual message (singular vs plural based on selection count)
  - Destructive styling for delete action button
  - Cancel button to abort deletion
  - Replaces browser `confirm()` dialog for better UX

**User Flow:**

1. Click "Select" button to enter selection mode
2. Checkboxes appear on all environment variable cards
3. Select individual items or use "Select All" button
4. Click "Delete (n)" button showing count of selected items
5. AlertDialog appears with confirmation message
6. Confirm deletion or cancel
7. Toast notification confirms success with count
8. Grid automatically refreshes to show remaining items
9. Selection mode exits automatically

**Visual Enhancements:**

- Selected cards show primary ring border for clear feedback
- Delete button disabled when no items selected
- Button states update during deletion (loading)
- Icons: CheckSquare (select all), Square (deselect all), Trash2 (delete)

**Error Handling:**

- Toast error if no items selected when clicking delete
- Server action error handling with user-friendly messages
- Graceful failure with data refetch on error
- Console logging for debugging without exposing secrets

**Files Created/Modified:**

- `components/ui/alert-dialog.tsx` - New shadcn/ui AlertDialog component
- `app/(app)/projects/[id]/actions.ts` - Added deleteEnvVariables server action
- `components/env-variables/env-variable-card.tsx` - Added selection support
- `components/env-variables/env-variable-grid.tsx` - Added selection props
- `components/env-variables/project-details-client.tsx` - Implemented delete flow

**Status Update:**

- Single Delete: ✅ Complete (via selection mode)
- Multi-Select Delete: ✅ Complete (bulk deletion with confirmation)
- Confirmation Dialog: ✅ Complete (shadcn/ui AlertDialog with animations)
- Selection UI: ✅ Complete (checkboxes, select all, visual feedback)

**Key Achievement:**

- Users can now efficiently delete one or multiple environment variables
- Modern confirmation dialog with smooth UX replaces browser alert
- Selection mode provides clear visual feedback and bulk operations
