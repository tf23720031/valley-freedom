# VALLEY FREEDOM V2 Implementation Plan

> **For agentic workers:** User selected direct native implementation in this session; work through the plan in order and verify every task before publishing.

**Goal:** Add a credible single-browser demo login and shared four-role workflows, prioritizing mobile usability and idempotent reservation/companion-demand state.

**Architecture:** Keep the existing React/Vite app and single `AppState` LocalStorage store. Raise the persisted schema with backward-compatible defaults, put validation and transitions in domain functions, and expose role-specific workspaces through guarded routes while retaining public browsing.

**Tech Stack:** React 19, TypeScript, React Router 7, Vitest/Testing Library, CSS, LocalStorage.

**Spec:** User request, “VALLEY FREEDOM V2｜展示登入、四角色協作與 Mobile-first 優化”.

## Global Constraints

- One shared demonstration account and one shared dataset; no real auth, payment, mail, or third-party login.
- Public routes remain accessible while private routes redirect to `/login`.
- Four roles reuse the same LocalStorage state and change workspaces without signing in again.
- Itinerary confirmation is item-by-item and idempotent; full capacity or expired sessions remain explicit failures.
- Companion maximum budget is a cap; each applicant submits a separate quote.
- Retain the existing brand, public exploration, and animation; mobile layout must work at 320–430px.

## Review Focus

- Old schema 1–3 local data must load with authentication off and new collections empty.
- Repeated itinerary confirmation must not duplicate bookings.
- Companion quote must never be inferred from the traveller's maximum budget.
- A companion acceptance race must allow only one accepted applicant and close the others.
- Logout must preserve every non-auth field in LocalStorage.

---

### Task 1: Shared login and role navigation

**Files:** `src/domain/types.ts`, `src/store/appStore.ts`, `src/features/auth/LoginPage.tsx`, `src/app/App.tsx`, `src/components/BrandShell.tsx`, auth tests.

- [ ] Add persisted auth and schema migration.
- [ ] Add a test login route with the shared test account and a public/private route guard.
- [ ] Add role workspace redirection and logout that only clears auth.
- [ ] Verify guest public browse, login persistence, role changes and logout.

### Task 2: Itinerary booking and headcount

**Files:** `src/domain/types.ts`, `src/domain/booking.ts`, new itinerary workflow module, `ItineraryPage.tsx`, operator booking display, tests.

- [ ] Add item party size, companion participation, and booking linkage.
- [ ] Confirm itinerary items one at a time, returning explicit success/failure per item and skipping already linked bookings.
- [ ] Enforce dates, capacity, positive count, and session duplicate checks.
- [ ] Add draft-save and confirmation summary controls; display traveller vs. companion occupancy and separate fees.

### Task 3: Companion demand and application marketplace

**Files:** shared types, new companion-demand domain module, new `/companions/requests` page, `CompanionPage.tsx`, tests and CSS.

- [ ] Validate and publish needs with a maximum budget and explicit service conditions.
- [ ] Rank companions by full/partial match and report missing conditions.
- [ ] Accept one applicant at their offered quote, close other applications, and synchronize itinerary service.
- [ ] Reject stale/cancelled/matched applications and support application withdrawal.

### Task 4: Workspaces, operator data and admin overview

**Files:** `OperatorPage.tsx`, new admin overview/store profile components, `YouthPage.tsx` link integration, route definitions, tests.

- [ ] Replace fixed operator date with current date.
- [ ] Show guest counts, companion inclusion, fee breakdown and session context to operators.
- [ ] Provide post-publish traveler link and protect capacity updates from occupied-seat reductions.
- [ ] Add verifiable Muri shop profile fields and a computed admin summary distinguishing candidate venues from partners.

### Task 5: Modal, mobile and end-to-end verification

**Files:** `Feedback.tsx`, stylesheets, app/domain tests and Playwright specs.

- [ ] Add focus management, Escape, focus return, inert background and mobile modal layout.
- [ ] Audit layout at 320, 375, 390, 430, 768 and desktop widths; honor reduced motion.
- [ ] Run shared-state traveler/operator/companion/admin scenarios, duplicate and capacity cases, then typecheck, tests and production build.
- [ ] Push the tested source to GitHub and deploy the saved production Site version.
