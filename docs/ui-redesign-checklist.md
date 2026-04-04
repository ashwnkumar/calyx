# Calyx UI/UX Redesign Checklist

Comprehensive checklist for the full UI revamp. Each section maps to a specific area of the app.
Mark items `[x]` as they are completed.

---

## 1. Global Design Tokens & Theme

- [x] Change `--radius` from `0rem` to `0.5rem` for softer corners across the app
- [x] Add subtle CSS transitions for interactive elements (buttons, cards, links)
- [x] Improve color usage — add accent background utilities for key sections
- [x] Review and refine dark mode contrast and consistency

---

## 2. Landing Page (`app/page.tsx`)

- [x] Condense page: remove Tech Stack, Security Details, and "Why Calyx" sections (move to README)
- [x] Redesign hero section — add gradient background, stronger visual hierarchy, tagline
- [x] Consolidate features into a compact 3-card grid (zero-knowledge, dev-friendly, version control)
- [x] Replace plain numbered "How It Works" list with a visual stepper/timeline
- [x] Simplify CTA section — single clear call-to-action
- [x] Redesign footer — lighter, less prominent

---

## 3. Auth Pages (`app/(auth)/login`, `app/(auth)/register`)

- [x] Add Calyx logo/branding and tagline to auth pages
- [x] Add a "Back to home" link for navigation
- [x] Add subtle background pattern or split-layout design (branding panel + form)
- [x] Add password strength indicator on register page
- [x] Uncomment and wire up "Forgot password?" link on login (or remove cleanly)

---

## 4. App Header (`components/app-header.tsx`)

- [x] Add user email or avatar indicator to show who's logged in
- [x] Move lock/unlock status into header as a compact pill/badge (replace persistent alert banner)
- [x] Add lock/unlock toggle button directly in header
- [x] Consolidate mobile nav — use a dropdown/sheet menu instead of cramped icon buttons
- [x] Add logout confirmation (or at minimum a label, not just a bare icon)

---

## 5. Passphrase Status Alert (`components/passphrase-status-alert.tsx`)

- [x] Remove the full-width persistent alert banner from the layout
- [x] Replace with compact header-integrated status (see Section 4)
- [x] Keep setup prompt as a one-time dismissable banner or dialog on first visit
- [x] Remove the always-visible "Secrets unlocked" green banner (unnecessary noise)

---

## 6. Dashboard / Project Listing

### `components/projects/project-listing-client.tsx`

- [x] Add a search/filter input for projects
- [x] Improve sort dropdown — show current sort label on mobile too

### `components/projects/project-card.tsx`

- [x] Replace hover-only delete button with a three-dot dropdown menu (accessible on touch)
- [x] Show both "Created" and "Last Updated" dates
- [x] Add subtle hover animation/elevation to cards

### `components/projects/empty-state.tsx`

- [x] Improve empty state with better onboarding copy and visual

---

## 7. Project Detail Page

### `components/env-variables/project-details-client.tsx`

- [x] Remove redundant `LockIndicator` (lock status already in header after Section 4)
- [x] Add breadcrumb navigation (Dashboard → Project Name)
- [x] Clean up inline name/description editing — hide pencil icons until hover, improve spacing
- [x] Improve action button layout for mobile

### `components/env-variables/env-file-card.tsx`

- [x] Remove "Click to view and manage" footer text (cursor already signals clickability)
- [x] Make delete button consistent — use three-dot dropdown menu like project cards

### `components/env-variables/empty-state.tsx`

- [x] Improve empty state messaging and visual

---

## 8. Env File Detail Page

### `components/env-variables/env-file-details-client.tsx`

- [x] Remove redundant `LockIndicator` (third instance of lock status)
- [x] Add breadcrumb navigation (Dashboard → Project → Env File)
- [x] Improve locked-state display — replace raw base64 preview with clean "encrypted" message
- [x] Fix action button layout on mobile (no uneven stretching)
- [x] Add line numbers to decrypted content display
- [x] Improve edit mode textarea (line numbers or better visual treatment)

---

## 9. Settings Page (`app/(app)/settings/page.tsx`)

- [x] Add account info section (email, created date)
- [x] Add theme preference section (move theme switcher here as a setting)
- [x] Add danger zone section (account/data management)
- [x] Make the page feel complete rather than a single lonely card

---

## 10. Dialogs & Modals

### `components/setup-dialog.tsx`

- [x] Review and ensure consistent styling with redesign

### `components/unlock-dialog.tsx`

- [x] Review and ensure consistent styling with redesign

### `components/change-passphrase-dialog.tsx`

- [x] Replace the two-step "App is Locked" alert with a disabled button + tooltip
- [x] Ensure consistent styling with redesign

---

## 11. Missing UX Patterns (Nice-to-haves)

- [x] Add project search to dashboard (covered in Section 6)
- [x] Add breadcrumbs to nested pages (covered in Sections 7 & 8)
- [x] Use the existing `ProjectGridSkeleton` on the dashboard page for loading states
- [x] Add page transition animations (subtle fade/slide)

---

## Progress Log

| Section                 | Status      | Date Completed |
| ----------------------- | ----------- | -------------- |
| 1. Global Design Tokens | ✅ Complete | 2026-04-04     |
| 2. Landing Page         | ✅ Complete | 2026-04-04     |
| 3. Auth Pages           | ✅ Complete | 2026-04-04     |
| 4. App Header           | ✅ Complete | 2026-04-04     |
| 5. Passphrase Alert     | ✅ Complete | 2026-04-04     |
| 6. Dashboard            | ✅ Complete | 2026-04-04     |
| 7. Project Detail       | ✅ Complete | 2026-04-04     |
| 8. Env File Detail      | ✅ Complete | 2026-04-04     |
| 9. Settings Page        | ✅ Complete | 2026-04-04     |
| 10. Dialogs             | ✅ Complete | 2026-04-04     |
| 11. Nice-to-haves       | ✅ Complete | 2026-04-04     |
