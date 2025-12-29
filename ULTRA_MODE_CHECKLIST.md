You are working on Antigravity ERP. Goal: make RBAC + Menu + Tabs/SubTabs behave SAP-grade WITHOUT changing UI design (flat sidebar, tabs inside pages stay the same). Current bug: unauthorized tabs/subtabs are visible due to prefix/startsWith inference; clicking redirects to first allowed tab or dashboard/access-denied; sub-sub tabs break parent visibility.

NON-NEGOTIABLE SAP RULES
1) "Visible => Actionable": If a menu/tab/subTab is visible, user must be able to open it without redirect/deny.
2) "Exact-match authorization": No startsWith/prefix permission inference for UI visibility or routing decisions.
3) "Single Source of Truth": One frozen registry drives:
   - sidebar visibility
   - tab/subTab visibility
   - route guards (ProtectedRoute)
   - preview engine ("what will user see?")
4) "No synthetic .access": Do not invent *.access permissions on client. Backend keeps DB slugs as-is.
5) "Write implies Read" ONLY as a formal normalization rule for UX (create/update/delete/export/approve -> read for the same resource), but it MUST be explicit + deterministic.

CANONICAL REGISTRY (FROZEN)
- Use/keep only: client/src/app/navigation/tabSubTab.registry.ts (or create it if missing)
- It must describe PAGES with their TAB and optional SUBTAB keys (exact URL contract), each with exact required permission slug(s).
- Our URL standard is query-based, NOT nested sidebar:
  Example: /admin/settings?tab=dictionaries&subTab=currency
  Tabs and subTabs must be filtered by exact permissions from this registry.

DELIVERABLES (must implement all)
A) REFACTOR: Remove prefix leaks and merge registries
1) Delete or deprecate these duplicate registries (and migrate consumers to the canonical frozen registry):
   - client/src/app/security/rbac.registry.ts
   - client/src/app/navigation/settings.registry.ts
   - client/src/app/navigation/settings-tabs.registry.ts
   - client/src/app/security/permission-slugs.ts (keep only if it is GENERATED from canonical registry; otherwise delete)
2) Replace any permission visibility logic using:
   - startsWith
   - includes
   - wildcard matching
   - child-implies-parent inference
   inside auth/menu/guard codepaths.
   Specifically audit and remove in:
   - client/src/app/auth/hooks/usePermissions.ts (current root leak)
   - SettingsPage.tsx tab filter logic
   - UsersPage.tsx tab logic
   - BillingPage.tsx tab logic
   - any MenuVisibilityEngine implementation that accepts prefixes

B) EXACT PERMISSION ENGINE (shared)
Create a single shared helper module (one file) used everywhere:
- ResolveAllowedTabs(pageKey, userPermissions) -> returns allowed tabs (exact permission match; plus deterministic write->read uplift)
- ResolveAllowedSubTabs(pageKey, tabKey, userPermissions) -> allowed subTabs
- GetFirstAllowedLocation(path, searchParams, userPermissions) -> returns a safe URL (same page, first allowed tab/subTab) OR "DENY"
This helper MUST be used by:
- Sidebar menu building
- ProtectedRoute
- Page-level tab rendering (SettingsPage/BillingPage/UsersPage)
No other permission logic for tabs/subtabs is allowed.

C) MENU DEFINITIONS (SAP model, flat sidebar)
- Sidebar must remain flat (NO nested sidebar menus).
- menu.definitions.ts must list ONLY page entries (Dashboard, Users, Billing, Settings, Console, Approvals, etc.).
- Each sidebar item’s link should be computed as: the page route + first allowed tab/subTab from the canonical registry.
- If a page has zero allowed tabs, the page MUST NOT appear in sidebar.

D) PROTECTED ROUTE (single behavior)
Rewrite ProtectedRoute to use canonical registry + shared helper:
- On enter:
  1) If auth is loading: render nothing/skeleton (no redirect)
  2) If not authenticated: redirect to /login
  3) Determine pageKey by pathname
  4) Compute allowed tabs/subtabs from helper
  5) If no allowed tabs: render terminal AccessDenied (NO "try again", only Logout; and MUST NOT be reachable by manual URL if user has permissions; it’s a terminal state for the current route)
  6) If query has tab/subTab not allowed: redirect to FIRST allowed tab/subTab within the SAME page (not dashboard)
- IMPORTANT: must not bounce to dashboard as a fallback. Dashboard fallback causes loops and violates SAP rule.
- AccessDenied route itself must be guarded: if user has any valid route, going to /access-denied by URL should redirect to their first allowed location; otherwise show AccessDenied.

E) SETTINGS TAB/SUBTAB FROZEN REGISTRY (exact to your UI)
Produce a "Tab/SubTab Frozen Registry Spec" in docs (1 page) and ensure code matches it.
- Settings uses query keys:
  /admin/settings?tab=general
  /admin/settings?tab=smtp
  /admin/settings?tab=dictionaries&subTab=currency
  /admin/settings?tab=dictionaries&subTab=country
  etc.
- For every tab/subTab define:
  - exact tabKey, subTabKey
  - URL shape
  - exact permission slug(s)

F) PERMISSION VERB NORMALIZATION
We standardize on "read/create/update/delete/export/approve/reject/etc."
- If backend still uses "view", migrate to "read" OR implement a canonical alias map in ONE place (not scattered).
- Do NOT keep both view and read in different registries.
- Implement a migration note and update seed/registry accordingly (server/prisma/seed.ts and server permission registry).

G) BUG FIXES FOR CURRENT REPRO CASES (must pass)
1) Users module:
   - If user has ONLY users.curators.read, they must see Users page and ONLY Curators tab; Users tab must not render at all.
   - If user has ONLY users.users.read, they must see Users page and ONLY Users tab.
   - No redirects to dashboard; invalid tab query redirects to first allowed tab on same page.
2) System Console:
   - If user has ONLY system_console.monitoring.dashboard.read, then only Console page should appear; and within Monitoring only Dashboard subtab should appear; other monitoring subtabs MUST be hidden, not clickable.
3) Settings:
   - If user has ONLY dictionaries currency permission, Settings page must appear and Settings left navigation must show ONLY dictionaries tab and ONLY currency subTab; nothing else.
4) Zero-permission user:
   - Must not enter the app. After login attempt, must receive an Azerbaijani message and be logged out / token rejected OR immediately redirected to a terminal "Səlahiyyətiniz yoxdur" screen with only Logout.

H) DELETE PLAN (step-by-step)
Create docs/delete-plan-rbac.md listing:
- exact files to delete
- replacement files/modules
- order of commits
- safety checks (tests passing per commit)

I) PLAYWRIGHT E2E (prove SAP behavior)
Add Playwright specs:
- users-curators-only.spec.ts
- users-users-only.spec.ts
- console-monitoring-dashboard-only.spec.ts
- settings-dictionaries-currency-only.spec.ts
Assertions:
- unauthorized tabs are NOT in DOM (not just disabled)
- clicking visible items never redirects to dashboard
- direct URL with unauthorized tab redirects to allowed tab within same page
- no access-denied loop on refresh

J) CI REGRESSION SCAN (repo-wide)
Add a CI step failing build if new prefix auth logic is introduced in auth/menu/guard paths.
Use ripgrep checks for startsWith/includes/wildcards in:
- client/src/app/security
- client/src/app/navigation
- client/src/app/routing
- client/src/domains/auth
Allowlist only non-auth string parsing.

WORKFLOW REQUIREMENTS
- Work in small commits, each commit must include:
  - what changed
  - why it fixes SAP rule violations
  - tests added/updated
- After each commit, run unit tests + Playwright smoke.
- Keep UI design unchanged (flat sidebar, tabs remain inside pages).

OUTPUT
1) Implemented code changes in the repo
2) docs/tab-subtab-frozen-spec.md
3) docs/delete-plan-rbac.md
4) Playwright tests
5) A short final report: "Before vs After" behaviors.

Start now by:
- Locating and listing all registries and permission check helpers
- Rewiring ProtectedRoute to canonical registry
- Refactoring usePermissions to exact match
- Refactoring SettingsPage/UsersPage/BillingPage to registry-driven visibility.
