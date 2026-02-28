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

### 2026-02-28 - Environment Variables Table View & UX Enhancements

**Table Layout Implementation:**

- Created `EnvVariableTable` component (`components/env-variables/env-variable-table.tsx`):
  - Replaced card-based grid with table layout for better data density
  - Integrated shadcn/ui Table component (added via CLI)
  - Columns: Key, Value, Status (lock icon), Created (relative time)
  - Selection checkbox column (conditional, only in selection mode)
  - Responsive design with max-width constraints
- Added shadcn/ui Tooltip component for long value truncation:
  - Values >50 characters automatically truncated with "..." suffix
  - Full value displayed on hover via tooltip
  - Prevents UI breaking with long environment variable values
  - Tooltip has max-width and proper text wrapping
- Updated `ProjectDetailsClient` to use table instead of grid:
  - Changed import from `EnvVariableGrid` to `EnvVariableTable`
  - Maintained all existing functionality (selection, delete, unlock/lock)

**Table Features:**

- **Key Column**: Displays environment variable key in monospace font with medium weight
- **Value Column**:
  - Locked: Shows truncated ciphertext (40 chars) in muted color
  - Unlocked: Shows decrypted value with truncation (50 chars) and tooltip
  - Inline action buttons: Copy (KEY=VALUE format), Download (.env file)
- **Status Column**: Lock/unlock icon centered for visual status
- **Created Column**: Relative timestamp (e.g., "2 hours ago") using date-fns
- **Selection Column**: Checkbox appears only when selection mode is active
- **Invalid Data Indicator**: AlertCircle icon for base64 validation failures

**Copy Behavior Enhancement:**

- Updated copy functionality to copy entire key-value pair:
  - Format: `KEY=VALUE` (e.g., `DATABASE_URL=postgresql://...`)
  - Changed from copying just the value to full .env format
  - Updated button tooltip to "Copy KEY=VALUE"
  - Maintains consistency with .env file format

**Title Field Removal:**

- Removed `title` field from entire add environment variable flow:
  - Updated `AddEnvDialog` component - removed title input field
  - Updated `EnvFormData` type in validation - removed title property
  - Updated `validateEnvFormData` - removed title validation logic
  - Updated `EncryptedEnvVar` type in server action - removed title field
  - Updated `EnvVariable` type across all components - removed title property
  - Updated database queries to exclude title column
  - Updated table to show only Key column (removed Title column)
- Simplified user flow: users only paste .env content without naming each batch

**Files Created/Modified:**

- `components/ui/table.tsx` - New shadcn/ui Table component (added via CLI)
- `components/ui/tooltip.tsx` - New shadcn/ui Tooltip component (added via CLI)
- `components/env-variables/env-variable-table.tsx` - New table component replacing grid
- `components/env-variables/project-details-client.tsx` - Updated to use table
- `components/env-variables/add-env-dialog.tsx` - Removed title field
- `components/env-variables/env-variable-card.tsx` - Removed title references (consistency)
- `lib/validations/env-variable.ts` - Removed title validation
- `app/(app)/projects/[id]/actions.ts` - Removed title from types and queries
- `app/(app)/projects/[id]/page.tsx` - Removed title from query and types

**Visual Improvements:**

- More compact and scannable layout compared to card grid
- Better use of horizontal space for displaying values
- Consistent row height and alignment
- Hover states on table rows for better interactivity
- Selected rows highlighted with muted background
- Tooltip provider wraps entire table for hover functionality

**Status Update:**

- Table Layout: ✅ Complete (replaced card grid with table)
- Long Value Handling: ✅ Complete (truncation with tooltip)
- Copy Enhancement: ✅ Complete (KEY=VALUE format)
- Title Field Removal: ✅ Complete (simplified add flow)
- UI Polish: ✅ Complete (consistent styling and interactions)

**Key Achievement:**

- Environment variables now displayed in a more efficient table format
- Long values no longer break the UI with smart truncation and tooltips
- Simplified add flow by removing unnecessary title field
- Copy functionality now provides complete .env format entries

### 2026-02-28 - Project Card Environment Variable Count

**Project Card Enhancement:**

- Added environment variable count display to project cards:
  - Badge with FileKey icon showing count in top-right corner of card
  - Uses shadcn/ui Badge component with secondary variant
  - Count extracted from Supabase aggregated query result
- Updated Supabase queries to include env_vars count:
  - Dashboard page query: `select("*, env_vars(count)")`
  - Create project action: `select("*, env_vars(count)")`
  - Leverages Supabase's built-in aggregation for efficient counting
- Updated Project type across all components:
  - Added `env_vars: { count: number }[]` property
  - Updated in: page.tsx, actions.ts, project-card.tsx, project-grid.tsx, project-listing-client.tsx, add-project-dialog.tsx
  - Maintains type consistency throughout the project listing flow

**Visual Design:**

- Badge positioned in card header next to project title
- FileKey icon (lucide-react) provides visual context
- Secondary variant styling for subtle, non-intrusive appearance
- Responsive layout with flex positioning

**User Experience:**

- Users can now see at a glance how many environment variables each project contains
- Helps identify active projects vs empty projects
- Provides context before clicking into project details
- New projects show "0" count initially

**Files Modified:**

- `app/(app)/page.tsx` - Updated query to include env_vars count
- `app/(app)/actions.ts` - Updated createProject to return count
- `components/projects/project-card.tsx` - Added badge with count display
- `components/projects/project-grid.tsx` - Updated Project type
- `components/projects/project-listing-client.tsx` - Updated Project type
- `components/projects/add-project-dialog.tsx` - Updated Project type

**Status Update:**

- Project Card Count: ✅ Complete (badge with icon showing env var count)
- Type Safety: ✅ Complete (consistent types across all components)
- Query Optimization: ✅ Complete (single query with aggregation)

**Key Achievement:**

- Project cards now provide immediate visibility into project contents
- Single aggregated query maintains performance
- Consistent type definitions prevent runtime errors

### 2026-02-28 - Project Delete Flow with Confirmation Dialogs

**Project Deletion Feature:**

- Added delete functionality to project cards:
  - Trash icon button appears on hover in card header
  - Button positioned next to env var count badge
  - Click event stops propagation to prevent card navigation
  - Opacity transition for smooth hover effect
- Implemented two-stage confirmation dialog system:
  - **First Dialog**: Basic confirmation for all project deletions
  - **Second Dialog**: Additional warning if project contains environment variables
  - Shows count of env vars that will be deleted
  - Emphasizes irreversible nature of deletion
- Created `deleteProject` server action (`app/(app)/actions.ts`):
  - Verifies user authentication and project ownership
  - Deletes project with RLS enforcement
  - Cascade deletion of associated env_vars via database constraints
  - Revalidates dashboard page cache after deletion

**User Flow:**

1. Hover over project card to reveal delete button
2. Click trash icon to open first confirmation dialog
3. If project is empty (0 env vars):
   - Confirm deletion → project deleted immediately
4. If project contains env vars:
   - First dialog closes, second warning dialog opens
   - Shows count of env vars that will be deleted
   - Requires explicit "Yes, Delete Everything" confirmation
5. Toast notification confirms successful deletion
6. Project card removed from grid with optimistic update

**Visual Design:**

- Trash icon in destructive color (red)
- Ghost button variant for subtle appearance
- Appears only on card hover (group-hover pattern)
- Smooth opacity transition for better UX
- AlertDialog with destructive action button styling

**State Management:**

- `isDeleteDialogOpen` - controls first confirmation dialog
- `isEnvVarsWarningOpen` - controls second warning dialog
- `isDeleting` - loading state during deletion
- Optimistic UI update removes project from grid immediately
- Error handling with toast notifications

**Security & Safety:**

- Two-stage confirmation prevents accidental deletions
- Clear warning about env vars being deleted
- RLS policies enforce ownership verification
- Database cascade ensures clean deletion of related data
- No orphaned env_vars records

**Files Modified:**

- `app/(app)/actions.ts` - Added deleteProject server action
- `components/projects/project-card.tsx` - Added delete button and dialogs
- `components/projects/project-grid.tsx` - Added onProjectDeleted callback
- `components/projects/project-listing-client.tsx` - Added deletion handler

**Status Update:**

- Project Delete: ✅ Complete (two-stage confirmation)
- Env Vars Warning: ✅ Complete (conditional second dialog)
- Optimistic Updates: ✅ Complete (immediate UI feedback)
- Error Handling: ✅ Complete (toast notifications)

**Key Achievement:**

- Safe project deletion with appropriate warnings based on content
- Two-stage confirmation prevents accidental data loss
- Smooth UX with hover states and optimistic updates
- Database cascade ensures clean deletion without orphaned records

### 2026-02-28 - Inline Project Name Editing

**Inline Edit Feature:**

- Added inline editing for project name in project details page:
  - Pencil icon appears on hover next to project title
  - Click to enter edit mode with input field
  - Save (check icon) and cancel (X icon) buttons
  - Enter key saves, Escape key cancels
  - Auto-focus on input when entering edit mode
- Created `updateProjectName` server action (`app/(app)/actions.ts`):
  - Validates name is not empty and within length limits
  - Checks for duplicate project names (excluding current project)
  - Updates project name with RLS enforcement
  - Revalidates both dashboard and project details pages
- Enhanced `ProjectDetailsClient` component:
  - Added edit state management (isEditingName, editedName, isSavingName)
  - Implemented edit/save/cancel handlers
  - Keyboard shortcuts for save (Enter) and cancel (Escape)
  - Loading state during save operation

**User Flow:**

1. Hover over project title to reveal edit button
2. Click pencil icon to enter edit mode
3. Input field appears with current name pre-filled
4. Edit the name and either:
   - Click check icon to save
   - Press Enter to save
   - Click X icon to cancel
   - Press Escape to cancel
5. Toast notification confirms successful update
6. Title updates immediately in UI

**Visual Design:**

- Pencil icon appears only on hover (group-hover pattern)
- Input field styled to match h1 heading (text-3xl, font-bold)
- Check icon in green for positive action
- X icon in muted color for cancel action
- Smooth transition for edit button opacity
- Disabled state during save operation

**Validation & Error Handling:**

- Empty name validation with error toast
- Duplicate name check with descriptive error
- No-op if name unchanged (avoids unnecessary API call)
- Error toast for failed updates
- Loading state prevents multiple submissions

**Files Modified:**

- `app/(app)/actions.ts` - Added updateProjectName server action
- `components/env-variables/project-details-client.tsx` - Added inline edit UI

**Status Update:**

- Inline Edit: ✅ Complete (hover to reveal, click to edit)
- Keyboard Shortcuts: ✅ Complete (Enter to save, Escape to cancel)
- Validation: ✅ Complete (empty check, duplicate check)
- Error Handling: ✅ Complete (toast notifications)

**Key Achievement:**

- Quick inline editing without modal dialogs
- Keyboard shortcuts for efficient workflow
- Proper validation prevents duplicate or empty names
- Smooth UX with hover states and loading indicators

### 2026-02-28 - Environment Variable Search Functionality

**Search Feature:**

- Added search functionality to environment variable table:
  - Search input with magnifying glass icon
  - Real-time filtering as user types
  - Searches by key name (always available)
  - Searches by decrypted value (when unlocked)
  - Case-insensitive search
  - Results count display showing filtered/total
- Implemented efficient filtering with useMemo:
  - Prevents unnecessary re-renders
  - Recalculates only when search query, env vars, or decrypted values change
  - Maintains performance with large lists
- Enhanced EnvVariableRow component:
  - Added onDecryptedValueChange callback
  - Notifies parent component when values are decrypted
  - Enables search by decrypted values when unlocked
- State management for decrypted values:
  - Map<string, string | null> stores decrypted values by ID
  - Updated as each row decrypts its value
  - Cleared when secrets are locked

**User Experience:**

- Search input positioned above table
- Placeholder text changes based on lock state:
  - Locked: "Search by key..."
  - Unlocked: "Search by key or value..."
- Results count shows: "Showing X of Y environment variables"
- Empty state message: "No environment variables match your search"
- Search persists during selection mode
- Clear search by deleting text

**Visual Design:**

- Search icon positioned inside input (left side)
- Input styled consistently with other form elements
- Results count in muted text below search
- Empty state centered in table with padding
- Smooth filtering without page jumps

**Performance:**

- useMemo prevents unnecessary filtering operations
- Decrypted values cached in Map for fast lookups
- Search only triggers on actual query changes
- No debouncing needed due to efficient filtering

**Files Modified:**

- `components/env-variables/env-variable-table.tsx` - Added search UI and filtering logic

**Status Update:**

- Search Input: ✅ Complete (with icon and placeholder)
- Key Search: ✅ Complete (always available)
- Value Search: ✅ Complete (when unlocked)
- Results Count: ✅ Complete (filtered/total display)
- Empty State: ✅ Complete (no matches message)

**Key Achievement:**

- Fast, real-time search across environment variables
- Intelligent search by both keys and decrypted values
- Efficient performance with memoized filtering
- Clear feedback on search results and empty states

### 2026-02-28 - Add Environment Variables Dialog Scrolling Fix

**Dialog Improvement:**

- Fixed dialog overflow issue when pasting long .env files:
  - Added max-height constraint (90vh) to dialog
  - Made dialog content scrollable with flexbox layout
  - Fixed header and footer while content scrolls
  - Increased textarea rows from 10 to 15 for better visibility
- Implemented proper layout structure:
  - Dialog uses flex column layout
  - Header is fixed at top (shrink-0)
  - Content area is scrollable (flex-1 overflow-y-auto)
  - Footer/buttons fixed at bottom (shrink-0 with border-top)
  - Added padding-right to scrollable area for scrollbar spacing
- Enhanced textarea behavior:
  - Set resize-none to prevent manual resizing
  - Maintains monospace font for code readability
  - Proper spacing and visual hierarchy

**User Experience:**

- Dialog no longer breaks viewport bounds
- Action buttons always accessible at bottom
- Smooth scrolling for long .env file content
- Visual separator (border) between content and actions
- Consistent spacing and padding throughout

**Technical Implementation:**

- Flexbox layout for proper height distribution
- overflow-y-auto on content container
- min-h-0 on form to allow flex shrinking
- Proper flex-shrink controls on header/footer

**Files Modified:**

- `components/env-variables/add-env-dialog.tsx` - Fixed scrolling layout

**Status Update:**

- Dialog Scrolling: ✅ Complete (max-height with overflow)
- Fixed Header/Footer: ✅ Complete (always visible)
- Content Scrolling: ✅ Complete (smooth overflow handling)

**Key Achievement:**

- Dialog remains functional and accessible regardless of content length
- Professional scrolling behavior matches modern UI patterns
- No need for dedicated page - dialog solution is elegant and efficient

### 2026-02-28 - Environment File Storage Architecture Refactor

**Schema Migration:**

- Updated `env_vars` table schema to store entire .env files:
  - Changed from individual KEY/VALUE pairs to full file storage
  - Added `name` field (NOT NULL) for environment file names (e.g., "production", "development")
  - Removed `key` field (no longer storing individual variables)
  - Kept `iv` and `ciphertext` fields for encrypted full file content
  - Added UNIQUE constraint on (project_id, name) to prevent duplicate file names
- Updated Supabase schema documentation (`.kiro/steering/supabase-schema.md`)

**Storage Approach:**

- Each env_vars record now represents a complete .env file
- Entire file content encrypted as single blob (preserves comments, formatting, blank lines)
- Multiple env files per project supported (production, development, frontend, backend, etc.)
- Perfect fidelity on download - exact file reconstruction

**Component Refactoring:**

- Updated `AddEnvDialog` component (`components/env-variables/add-env-dialog.tsx`):
  - Added name input field for environment file naming
  - Removed individual variable parsing logic
  - Now encrypts entire textarea content as single blob
  - Updated validation to require both name and content
  - Changed dialog title and description to reflect file-based approach
- Created `addEnvFile` server action (`app/(app)/projects/[id]/actions.ts`):
  - Replaces `addEnvVariables` action
  - Inserts single env_vars record with encrypted full content
  - Handles unique constraint violations with user-friendly error messages
  - Returns single EnvFile record instead of array
- Renamed `deleteEnvVariables` to `deleteEnvFiles` for consistency
- Updated `ProjectDetailsClient` component (`components/env-variables/project-details-client.tsx`):
  - Simplified to display env files as cards instead of table
  - Removed selection mode, bulk operations, and table complexity
  - Grid layout with EnvFileCard components
  - Clicking card navigates to env file details page
  - Removed download controls (moved to individual file pages)
- Created `EnvFileCard` component (`components/env-variables/env-file-card.tsx`):
  - Card-based display for each environment file
  - Shows file name, creation date, and delete button
  - Click card to navigate to `/projects/{projectId}/env/{fileId}`
  - Delete button with confirmation dialog
  - Calendar icon for creation date display
- Updated project details page (`app/(app)/projects/[id]/page.tsx`):
  - Changed query to select `name` instead of `key`
  - Updated types from EnvVariable to EnvFile
  - Passes initialEnvFiles to ProjectDetailsClient

**Benefits of New Approach:**

- **Preserves Everything**: Comments, blank lines, formatting, commented-out variables
- **Simpler Mental Model**: One file = one record, not parsed into pieces
- **Multiple Environments**: Easy to store prod, dev, staging files separately
- **Perfect Fidelity**: Download exactly what was uploaded
- **Less Complexity**: No parsing/reconstruction logic needed

**Files Created:**

- `components/env-variables/env-file-card.tsx` - Card component for env files

**Files Modified:**

- `.kiro/steering/supabase-schema.md` - Updated schema documentation
- `components/env-variables/add-env-dialog.tsx` - Refactored for file-based storage
- `components/env-variables/project-details-client.tsx` - Simplified to card grid
- `app/(app)/projects/[id]/actions.ts` - New addEnvFile and deleteEnvFiles actions
- `app/(app)/projects/[id]/page.tsx` - Updated types and queries

**Files Deprecated:**

- `components/env-variables/env-variable-table.tsx` - No longer used (table replaced with cards)
- `components/env-variables/env-variable-card.tsx` - No longer used (replaced with EnvFileCard)
- `components/env-variables/env-variable-grid.tsx` - No longer used
- `lib/parsers/env-parser.ts` - No longer needed (no parsing on upload)
- `lib/parsers/env-parser.test.ts` - No longer needed

**Status Update:**

- Environment File Storage: ✅ Complete (full file encryption)
- Multiple Files Per Project: ✅ Complete (named env files)
- Add Env File Dialog: ✅ Complete (name + content inputs)
- Env File Cards: ✅ Complete (grid display with navigation)
- Delete Env Files: ✅ Complete (confirmation dialog)

**Next Steps:**

- Create env file details page at `/projects/{projectId}/env/{fileId}`
- Implement view/copy/download functionality for individual files
- Add edit capability for env file content
- Implement decryption and display of file contents when unlocked

**Key Achievement:**

- Migrated from individual variable storage to full file storage
- Preserves all comments, formatting, and structure
- Supports multiple named environment files per project
- Simplified architecture with better user experience

### 2026-02-28 - Environment File Details Page Implementation

**Env File Details Page:**

- Created env file details page (`app/(app)/projects/[projectId]/env/[fileId]/page.tsx`):
  - Dynamic route for individual environment file viewing
  - UUID validation for both projectId and fileId
  - Fetches project metadata and env file data with RLS enforcement
  - Error handling for invalid/unauthorized access
- Implemented `EnvFileDetailsClient` component (`components/env-variables/env-file-details-client.tsx`):
  - Automatic decryption when unlocked (via useEffect)
  - Shows encrypted ciphertext when locked (truncated preview)
  - Full decrypted content display in monospace pre block when unlocked
  - Lock/unlock icon indicators in page header
  - Formatted creation date display

**Copy & Download Functionality:**

- Copy button:
  - Locked: Copies encrypted content (iv:ciphertext format)
  - Unlocked: Copies decrypted plaintext content
  - Toast notifications for success/failure
- Download button:
  - Locked: Downloads as `.encrypted.txt` file
  - Unlocked: Downloads as `.env` file with proper naming
  - Filename format: `{projectName}-{envFileName}.env`

**Edit Functionality:**

- Edit mode toggle:
  - Edit button appears only when unlocked
  - Switches to textarea for content editing
  - Cancel button to discard changes
  - Save button with loading state
- Save operation:
  - Re-encrypts edited content with new IV
  - Calls `updateEnvFile` server action
  - Updates local state optimistically
  - Revalidates cache for both project and file pages
  - Toast notifications for success/error
- Created `updateEnvFile` server action (`app/(app)/projects/[projectId]/env/[fileId]/actions.ts`):
  - Verifies authentication and ownership
  - Updates iv, ciphertext, and updated_at timestamp
  - RLS enforcement via Supabase queries
  - Returns updated EnvFile record

**UI/UX Features:**

- Breadcrumb navigation: Back button to project details
- Lock indicator banner (reused component)
- Card-based content display with proper styling
- Responsive layout with max-width container
- Loading states for decryption and saving
- Disabled states during save operation
- Proper error handling with user-friendly messages

**Security Considerations:**

- ✅ Decryption only happens when cryptoKey is available
- ✅ Edit mode only accessible when unlocked
- ✅ New IV generated on each save (never reused)
- ✅ No plaintext exposure in locked state
- ✅ Proper cleanup on lock transition (via useEffect)

**Files Created:**

- `app/(app)/projects/[projectId]/env/[fileId]/page.tsx` - File details page
- `app/(app)/projects/[projectId]/env/[fileId]/actions.ts` - Update server action
- `components/env-variables/env-file-details-client.tsx` - Client component

**Status Update:**

- Env File Details Page: ✅ Complete (view, copy, download, edit)
- Decryption Display: ✅ Complete (automatic on unlock)
- Edit & Save: ✅ Complete (re-encryption with new IV)
- Navigation: ✅ Complete (breadcrumb back to project)

**Key Achievement:**

- Complete CRUD functionality for environment files
- Users can now view, edit, copy, and download individual env files
- Seamless locked/unlocked state transitions
- Zero-knowledge architecture maintained throughout edit flow

### 2026-02-28 - Inline Environment File Name Editing

**Name Editing Feature:**

- Added inline name editing to env file details page:
  - Pencil icon appears on hover next to file name
  - Click to enter edit mode with input field
  - Save (Check icon) and Cancel (X icon) buttons
  - Enter key to save, Escape key to cancel
  - Loading state during save operation
- Created `updateEnvFileName` server action (`app/(app)/projects/[id]/env/[fileId]/actions.ts`):
  - Validates name is not empty
  - Checks for unique constraint violations (duplicate names in same project)
  - Updates name and updated_at timestamp
  - Revalidates cache for both project and file pages
  - Returns updated EnvFile record
- Updated `EnvFileDetailsClient` component:
  - Added state management for name editing (isEditingName, editedName, isSavingName)
  - Implemented handlers: handleEditNameClick, handleCancelNameEdit, handleSaveName, handleNameKeyDown
  - Updated UI to show input field or name with edit button
  - Lock icon moved inside the name group for better layout
  - Toast notifications for success/error

**User Experience:**

- Hover over file name to reveal edit button
- Click edit button to enter edit mode
- Type new name and press Enter or click Check icon
- Press Escape or click X icon to cancel
- Duplicate name validation with user-friendly error message
- Smooth transitions between edit and view modes

**Files Modified:**

- `components/env-variables/env-file-details-client.tsx` - Added inline name editing UI and handlers
- `app/(app)/projects/[id]/env/[fileId]/actions.ts` - Added updateEnvFileName server action

**Status Update:**

- Inline Name Editing: ✅ Complete (edit, save, cancel with keyboard shortcuts)
- Duplicate Name Validation: ✅ Complete (unique constraint enforcement)
- UI Polish: ✅ Complete (hover states, transitions, icons)

**Key Achievement:**

- Users can now rename environment files inline without leaving the details page
- Consistent UX pattern with project name editing
- Proper validation prevents duplicate names within the same project

### 2026-02-28 - Project Description Inline Editing

**Description Editing Feature:**

- Added inline description editing to project details page:
  - Pencil icon appears on hover next to description (or "No description" text)
  - Click to enter edit mode with textarea
  - Save (Check icon) and Cancel (X icon) buttons stacked vertically
  - Escape key to cancel, Ctrl/Cmd+Enter to save
  - Loading state during save operation
  - Supports empty descriptions (shows "No description" in italic)
- Created `updateProjectDescription` server action (`app/(app)/actions.ts`):
  - Accepts description or null for empty
  - Updates description and updated_at timestamp
  - Revalidates cache for both dashboard and project pages
  - Returns updated project record
- Updated `ProjectDetailsClient` component:
  - Added state management for description editing (isEditingDescription, editedDescription, isSavingDescription)
  - Implemented handlers: handleEditDescriptionClick, handleCancelDescriptionEdit, handleSaveDescription, handleDescriptionKeyDown
  - Updated UI to show textarea or description with edit button
  - Textarea with 2 rows, 500 character limit, placeholder text
  - Toast notifications for success/error

**User Experience:**

- Hover over description to reveal edit button
- Click edit button to enter edit mode with textarea
- Type description and press Ctrl/Cmd+Enter or click Check icon
- Press Escape or click X icon to cancel
- Empty descriptions allowed (shows "No description" placeholder)
- Smooth transitions between edit and view modes

**Files Modified:**

- `components/env-variables/project-details-client.tsx` - Added inline description editing UI and handlers
- `app/(app)/actions.ts` - Added updateProjectDescription server action

**Status Update:**

- Inline Description Editing: ✅ Complete (edit, save, cancel with keyboard shortcuts)
- Empty Description Support: ✅ Complete (null handling with placeholder)
- UI Polish: ✅ Complete (hover states, transitions, icons)

**Key Achievement:**

- Users can now edit project descriptions inline without leaving the details page
- Consistent UX pattern with name editing
- Supports both filled and empty descriptions gracefully

### 2026-02-28 - Mobile Responsive Design Improvements

**Comprehensive Responsiveness Audit:**

- Reviewed entire application for mobile screen compatibility (320px+)
- Identified and fixed layout issues across all major pages and components
- Implemented consistent responsive patterns using Tailwind breakpoints

**Layout & Container Fixes:**

- Updated main app layout (`app/(app)/layout.tsx`):
  - Responsive padding: `px-4 sm:px-6`, `py-4 sm:py-6`
  - Responsive spacing: `space-y-3 sm:space-y-4`
- Enhanced app header (`components/app-header.tsx`):
  - Responsive logo sizing: `text-xl sm:text-2xl`
  - Responsive padding: `p-3 sm:p-4`, `px-4 sm:px-6`
  - Tighter gaps on mobile: `gap-2 sm:gap-4`
- Updated app footer (`components/app-footer.tsx`):
  - Flex direction switch: `flex-col sm:flex-row`
  - Proper gap spacing for mobile stacking

**Project Listing Page:**

- Enhanced `ProjectListingClient` component:
  - Responsive header layout: `flex-col sm:flex-row`
  - Full-width button on mobile: `w-full sm:w-auto`
  - Responsive title sizing: `text-2xl sm:text-3xl`
  - Responsive spacing: `space-y-4 sm:space-y-6`
- Updated `ProjectGrid` component:
  - Earlier breakpoint: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Responsive gap: `gap-3 sm:gap-4`
- Enhanced `ProjectCard` component:
  - Responsive title sizing: `text-lg sm:text-xl`
  - Proper text wrapping with `break-words`

**Project Details Page:**

- Enhanced `ProjectDetailsClient` component:
  - Responsive container padding: `px-4 sm:px-6`, `py-4 sm:py-6`
  - Flexible header layout: `flex-col sm:flex-row`
  - Responsive title sizing: `text-2xl sm:text-3xl`
  - Title truncation with `min-w-0` and `truncate`
  - Full-width "Add" button on mobile: `w-full sm:w-auto`
  - Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Responsive spacing: `gap-3 sm:gap-4`

**Environment File Details Page:**

- Enhanced `EnvFileDetailsClient` component:
  - Responsive container padding: `px-4 sm:px-6`, `py-4 sm:py-6`
  - Flexible header with back button: proper alignment with `items-start`
  - Responsive title sizing: `text-xl sm:text-2xl lg:text-3xl`
  - Title truncation to prevent overflow
  - Responsive action buttons:
    - Wrap on mobile with `flex-wrap`
    - Icon-only on mobile (hide text labels): `hidden sm:inline`
    - Flexible sizing: `flex-1 sm:flex-none`
    - Smaller button size on mobile: `size="sm"`
  - Responsive content card:
    - Smaller font sizes: `text-xs sm:text-sm`
    - Responsive padding: `p-3 sm:p-4`
    - Responsive textarea height: `min-h-[300px] sm:min-h-[400px]`

**Environment Variable Components:**

- Updated `EnvVariableCard` component:
  - Responsive padding: `p-3 sm:p-4`
  - Side-by-side buttons on desktop: `flex-col sm:flex-row`
  - Flexible button sizing: `flex-1` on mobile
- Enhanced `EnvVariableTable` component:
  - Horizontal scroll wrapper: `overflow-x-auto`
  - Responsive font sizes: `text-xs sm:text-sm`

**Touch Device Improvements:**

- Fixed hover-only edit buttons for mobile:
  - Changed pattern from `opacity-0 group-hover:opacity-100`
  - To: `sm:opacity-0 sm:group-hover:opacity-100`
  - Edit buttons now always visible on mobile (no hover state)
  - Desktop retains hover-to-reveal behavior
- Applied to:
  - Project name edit button
  - Project description edit button
  - Environment file name edit button

**Typography & Spacing:**

- Consistent responsive heading sizes across all pages
- Responsive spacing between sections
- Proper text truncation to prevent overflow
- Responsive padding and margins throughout

**Files Modified:**

- `app/(app)/layout.tsx` - Responsive padding and spacing
- `components/app-header.tsx` - Responsive logo and gaps
- `components/app-footer.tsx` - Flex direction switch
- `components/projects/project-listing-client.tsx` - Responsive header and button
- `components/projects/project-grid.tsx` - Earlier breakpoint
- `components/projects/project-card.tsx` - Responsive title sizing
- `components/env-variables/project-details-client.tsx` - Comprehensive mobile layout
- `components/env-variables/env-file-details-client.tsx` - Responsive header and buttons
- `components/env-variables/env-variable-card.tsx` - Responsive padding and buttons
- `components/env-variables/env-variable-table.tsx` - Horizontal scroll

**Responsive Breakpoints Used:**

- `sm:` (640px) - Primary mobile-to-tablet breakpoint
- `md:` (768px) - Tablet breakpoint (used sparingly)
- `lg:` (1024px) - Desktop breakpoint for 3-column grids

**Status Update:**

- Mobile Layout: ✅ Complete (320px+ support)
- Touch Interactions: ✅ Complete (always-visible edit buttons)
- Responsive Typography: ✅ Complete (scaled heading sizes)
- Responsive Spacing: ✅ Complete (consistent padding/margins)
- Horizontal Overflow: ✅ Complete (tables and long content)

**Key Achievement:**

- Application now fully responsive from 320px mobile screens to large desktops
- Touch-friendly interactions with always-visible controls on mobile
- Consistent responsive patterns across all pages and components
- Proper text truncation and overflow handling prevents layout breaks

### 2026-02-28 - SEO & Metadata Implementation

**Metadata Enhancement:**

- Enhanced root layout (`app/layout.tsx`):
  - Added title template pattern: `%s | Calyx`
  - Comprehensive keywords array for SEO
  - OpenGraph metadata for social sharing
  - Twitter card metadata
  - Robots directive (noindex/nofollow for personal app)
  - Authors and creator metadata
- Added metadata to all page routes:
  - Dashboard page (`app/(app)/page.tsx`) - "Dashboard" with description
  - Dashboard layout (`app/(app)/layout.tsx`) - Default dashboard metadata
  - Login page (`app/(auth)/login/page.tsx`) - "Login" with auth description
  - Auth layout (`app/(auth)/layout.tsx`) - "Authentication" metadata
- Implemented dynamic metadata for project details page:
  - Created `generateMetadata` function (`app/(app)/projects/[id]/page.tsx`)
  - Fetches project name and description from database
  - Dynamic title based on project name
  - Graceful fallback for invalid/missing projects
  - SEO-friendly descriptions highlighting zero-knowledge encryption

**SEO Features:**

- Proper title hierarchy with template inheritance
- Descriptive meta descriptions for all pages
- Keywords targeting: secrets manager, environment variables, zero-knowledge, encryption
- Social media preview support (OpenGraph + Twitter cards)
- Privacy-focused robots directive (noindex/nofollow)

**Files Modified:**

- `app/layout.tsx` - Enhanced with comprehensive metadata
- `app/(app)/layout.tsx` - Added dashboard metadata
- `app/(app)/page.tsx` - Added page-specific metadata
- `app/(auth)/layout.tsx` - Added auth metadata
- `app/(auth)/login/page.tsx` - Added login metadata
- `app/(app)/projects/[id]/page.tsx` - Added dynamic metadata generation

**Status Update:**

- Root Metadata: ✅ Complete (title template, keywords, OpenGraph, Twitter)
- Static Page Metadata: ✅ Complete (dashboard, login, auth)
- Dynamic Metadata: ✅ Complete (project details with database fetch)
- Social Sharing: ✅ Complete (OpenGraph and Twitter card support)

**Key Achievement:**

- Comprehensive SEO structure across all pages
- Dynamic metadata generation for project-specific pages
- Social media preview support for sharing
- Privacy-focused configuration for personal app

### 2026-02-28 - Project Completion & Documentation

**README Creation:**

- Created comprehensive GitHub README (`README.md`):
  - Personal story about the motivation behind building Calyx
  - Friendly, developer-focused tone explaining the "lost .env files" problem
  - Feature highlights with emoji for visual appeal
  - Complete tech stack listing
  - Security details explaining zero-knowledge architecture
  - Getting started guide with installation steps
  - Database schema overview
  - Project structure documentation
  - Etymology of the name "Calyx"
  - Acknowledgments for key technologies used

**Documentation Highlights:**

- Explains the real-world problem: hunting for env files across devices
- Emphasizes zero-knowledge security in accessible language
- Provides clear setup instructions for new users
- Links to relevant documentation and external resources
- Professional yet approachable tone throughout

**Files Created:**

- `README.md` - Complete project documentation for GitHub

**Status Update:**

- Project Documentation: ✅ Complete (comprehensive README)
- Project Status: ✅ Complete (all core features implemented)

**Key Achievement:**

- Calyx is now fully documented and ready for GitHub
- README tells the story of why the project exists
- Clear instructions for anyone wanting to run their own instance

### 2026-02-28 - Public About Page Implementation

**About Page Creation:**

- Created publicly accessible About page (`app/about/page.tsx`):
  - Comprehensive overview of Calyx project and motivation
  - Sections: The Problem, What Makes It Different, Features, How It Works, Security Details, Tech Stack, Why "Calyx"
  - Card-based layout for key differentiators (Zero-Knowledge, Built for Developers, Actually Secure)
  - Feature grid with icons highlighting main capabilities
  - Security details card with technical specifications
  - Tech stack grid showing all technologies used
  - Call-to-action section with "Get Started" and "View on GitHub" buttons
  - Responsive design with mobile-first approach
  - Custom header and footer for standalone page experience

**Navigation Integration:**

- Added About link to app header (`components/app-header.tsx`):
  - Info icon button with "About" label (icon-only on mobile)
  - Positioned between logo and theme switcher
  - Ghost button variant for subtle appearance
- Enhanced login page (`app/(auth)/login/page.tsx`):
  - Added header with Calyx logo, About link, and theme switcher
  - Consistent navigation experience across public pages
  - Flexbox layout to accommodate header and centered login form

**Content Highlights:**

- Personal story about the "lost .env files" problem
- Friendly, developer-focused tone throughout
- Emphasis on zero-knowledge architecture and security
- Step-by-step "How It Works" guide
- Detailed security specifications for transparency
- Complete tech stack listing
- Etymology of "Calyx" name (protective flower layer)

**Files Created:**

- `app/about/page.tsx` - Public About page with comprehensive project information

**Files Modified:**

- `components/app-header.tsx` - Added About navigation link
- `app/(auth)/login/page.tsx` - Added header with About link

**Status Update:**

- About Page: ✅ Complete (publicly accessible, comprehensive content)
- Navigation: ✅ Complete (accessible from dashboard and login)
- Responsive Design: ✅ Complete (mobile-friendly layout)

**Key Achievement:**

- Users can now learn about Calyx without signing in
- Consistent navigation experience across public and protected pages
- About page mirrors README content for web visitors
- Professional presentation of project motivation and technical details

### 2026-02-28 - About Page Middleware Fix

**Middleware Configuration:**

- Fixed About page accessibility issue for unauthenticated users:
  - Updated `lib/supabase/proxy.ts` to allow `/about` route without authentication
  - Added `/about` to the list of public routes alongside `/login` and `/auth`
  - Middleware was previously redirecting all unauthenticated users to `/login`
- About page now accessible to both authenticated and unauthenticated users:
  - Works from login page (before authentication)
  - Works from dashboard (after authentication)
  - Direct URL navigation works correctly

**Technical Details:**

- Modified `updateSession` function in Supabase proxy
- Added condition: `!request.nextUrl.pathname.startsWith("/about")`
- Prevents redirect loop when accessing About page without authentication

**Files Modified:**

- `lib/supabase/proxy.ts` - Added `/about` to public routes whitelist

**Status Update:**

- About Page Access: ✅ Complete (accessible to all users)
- Middleware Configuration: ✅ Complete (public route whitelisting)

**Key Achievement:**

- About page now truly public and accessible from anywhere
- No authentication required to learn about Calyx
- Consistent navigation experience for all users

### 2026-02-28 - Build Error Fixes

**Clipboard Utility Refactor:**

- Fixed TypeScript build error in clipboard functionality:
  - Changed `copyToClipboard` return type from `Promise<void>` to `Promise<boolean>`
  - Removed internal toast notifications from clipboard utility
  - Moved toast notifications to calling components for better control
  - Updated all usages across the application to handle boolean return value
- Updated components:
  - `components/env-variables/env-file-details-client.tsx` - Added success/error handling
  - `components/env-variables/env-variable-table.tsx` - Added success/error handling
  - `components/env-variables/env-variable-card.tsx` - Added success/error handling
  - `lib/clipboard-utils.ts` - Refactored to return boolean instead of throwing errors

**Build Status:**

- ✅ TypeScript compilation successful
- ✅ Next.js production build successful
- ✅ All routes generated correctly
- ✅ No build errors

**Files Modified:**

- `lib/clipboard-utils.ts` - Changed return type and removed internal toasts
- `components/env-variables/env-file-details-client.tsx` - Updated to handle boolean return
- `components/env-variables/env-variable-table.tsx` - Updated to handle boolean return
- `components/env-variables/env-variable-card.tsx` - Updated to handle boolean return

**Key Achievement:**

- Production build now passes without errors
- Clipboard functionality properly handles success and failure cases
- Better separation of concerns with toast notifications in UI components
