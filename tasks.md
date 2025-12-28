ULTRA-MODE MASTER PROMPT (RQI ERP — SAP/Bank-Grade RBAC + Workflow/Approvals/Notifications + Compliance)
You are Antygravity. Work as a senior full-stack security engineer. Deliver production-grade solutions. No shortcuts, no frontend-only auth, no owner bypass, no hardcoded permissions. Everything must be deterministic, testable, and auditable.

========================
0) PROJECT REALITY / CONSTRAINTS
========================
Repo structure MUST remain as-is (do not invent new top-level folders):
- client/ (React)
- server/ (NestJS)
- DB via Prisma (already used)
- Existing navigation: sidebar MUST stay FLAT (no nested submenus in sidebar). Submenus MUST be implemented via tabs & query params (tab/subTab).
- Admin vs Tenant separation MUST be strict across DB + backend + frontend.
- Current bugs to fix:
  A) “submodule-only permission” breaks menu. Example: Users menu has tabs: users + curators.
     - If curator permission exists but users permission doesn’t, the menu becomes non-functional or redirects wrongly.
     - “Read-only” permissions currently don’t work unless “Full access” is selected. This is unacceptable.
  B) AccessDenied loop / random AccessDenied after refresh or after changes.
  C) Parent items with child tabs are not opening the correct default tab when only some tabs are allowed.
  D) Some sidebar items render but clicking does nothing unless user manually edits URL.
  E) list engine issues: filters/search/sort/pagination inconsistent; pageSize=100 appears unexpectedly.
  F) Role approval actions currently appear in Role list actions; requirement: “Send for approval” should create an approval request that appears ONLY in Approvals module, not act inside the role list as a direct approve/reject path.

Non-negotiable UX:
- If user has ZERO usable permissions for current panel, they must NOT enter panel pages; must land on Access Restricted terminal page with ONLY “Sign out”.
- AccessDenied page must be terminal. No retry. No navigation. No internal system hints.
- Users must not reach /access-denied or /forgot-password etc. while authenticated by URL manipulation if policy disallows.
- Tabs/subTabs must be reflected in URL and persist on refresh (deep link stable).

========================
1) TERMINOLOGY & PRINCIPLES (FROZEN)
========================
1.1 Scopes
- SYSTEM scope => Admin Panel only
- TENANT scope => Tenant Panel only
Hard rule: SYSTEM role cannot receive TENANT permissions and vice versa.
Hard rule: Tenant users cannot see Admin Panel menus/routes even by URL.
Hard rule: Admin users cannot see Tenant panel.

1.2 Permission semantics
We will NOT rely on “view” permissions if it creates maintenance debt, BUT we still need “route/menu visibility” logic.
Final rule:
- “Read” is the minimum permission to enter a screen that displays data.
- Any non-read action (create/update/delete/manage/approve/export) MUST imply read.
Thus: if a user is granted create/update/delete/manage for a resource, then read MUST be automatically enforced (normalization).
Menu visibility is derived from “hasAnyEffectivePermission(resource)” which includes normalized read.

1.3 Menu model
Sidebar is FLAT. Each sidebar item routes to a page.
Any “submodule” must be represented by query params:
- /admin/users?tab=curators
- /admin/settings?tab=dictionaries&subTab=currency
No sidebar nesting.

1.4 Approval / 4-eyes
4-eyes principle = separation-of-duties for sensitive changes.
Meaning: Maker submits change -> Checker approves/rejects.
We implement it using Workflow Engine + Approvals inbox + Notifications + Audit timeline.
Roles/Permissions changes are high-risk operations and must go through approvals (configurable per workflow).

========================
2) REQUIRED DELIVERABLES (IMPLEMENTATION)
========================

2.1 Single Source of Truth registries
Create/Finalize these registries:
A) permission prefix standard (ADMIN vs TENANT)
- Example:
  ADMIN/SYSTEM prefix: platform.*
  TENANT prefix: tenant.*
No mixing allowed. Enforce in DB constraints + backend validations.
B) Settings tab/subTab registry (frozen)
- Defines all allowed tab and subTab values and maps each to a permission requirement.
- Must support: /admin/settings?tab=dictionaries&subTab=currency pattern.
- Must be used by:
  - Menu visibility engine
  - Route guard
  - Preview engine

2.2 Menu Visibility Engine (core bug fix)
Goal: If user has permission for ANY tab of a page, the sidebar item is visible and clickable.
Clicking must navigate to the FIRST allowed tab/subTab for that page (deterministic).
Requirements:
- Build `resolveFirstAllowedPath(menuItem, permissions)`:
  - If menuItem has tab registry, pick first permitted tab, then first permitted subTab if needed.
  - If user only has curator permission under Users, the Users sidebar must still work and open /admin/users?tab=curators (NOT dashboard, not blank).
- Build `filterMenu(menu, permissions)`:
  - Parent/sidebar item visible if ANY child/tab is allowed.
  - Never show a sidebar item that resolves to “no allowed path”.
- Ensure clicks always navigate to a valid path (no “dead clicks”).

2.3 Route Guard (frontend) + Guard (backend)
Frontend:
- ProtectedRoute MUST:
  - Wait for auth hydration (avoid “login page flashes”).
  - If authenticated but no allowed route for this panel => terminal Access Restricted page.
  - If authenticated and tries to visit disallowed route/tab/subTab => redirect to first allowed route for panel.
  - Prevent /login, /forgot-password, /access-denied from being reachable when authenticated (policy-controlled).
Backend:
- Guard must enforce permissions per endpoint and scope.
- Never trust frontend routes.
- Return consistent 403 with correlation id. UI shows localized AZ message without leaking internals.

2.4 AccessDenied stability (stop random redirects)
Introduce Auth finite-state machine (FSM) in client:
States:
- INIT (unknown)
- HYDRATING (loading token + /me)
- AUTHENTICATED (me loaded)
- UNAUTHORIZED (token invalid)
- AUTHZ_DENIED (authenticated but no allowed routes in this panel)
Transitions must be deterministic.
Rule: Never redirect while in HYDRATING except to show a skeleton.
Rule: Redirect decisions happen only after AUTHENTICATED is stable.
Fix the “refresh sends to access denied” issue by ensuring:
- Guards do not compute menu/firstRoute before permissions are loaded.
- No permission mutation races in AuthContext/authSlice.

2.5 Roles & Role-Permissions (bank-grade)
Implement:
- Role listing + create/edit (Admin panel).
- Role-permissions update = “full replace diff”:
  - If new set differs, compute toAdd/toRemove and apply atomically inside a DB transaction.
  - If permissions removed from role, they MUST be deleted from role_permissions table.
  - If permissions added, they MUST be inserted.
- Add optimistic concurrency:
  - Role.version increments on update.
  - If mismatch => 409 conflict.
- Add locked roles:
  - e.g., system owner role cannot be edited unless break-glass policy.
- Enforce scope mismatch rules in backend.
- Ensure “non-read implies read” normalization happens:
  - In UI selection AND in backend normalization AND in DB constraints when possible.

2.6 Approvals module integration (Maker/Checker)
Requirement change:
- Role list actions must NOT directly approve/reject.
Instead:
- “Send for approval” creates ApprovalRequest (type=ROLE_CHANGE or ROLE_CREATE, payload diff).
- The approval appears in /admin/approvals (single Approvals module).
- Approvers do actions (Approve/Reject/Delegate/Escalate/Cancel) from Approvals module only.
- Role status is:
  - DRAFT (editable)
  - PENDING_APPROVAL (locked)
  - APPROVED (active)
  - REJECTED (inactive with audit)
Workflow Engine defines:
- Sequential (“Növbəli”) vs Parallel approval stages.
- Approver selection by role OR by explicit users.
- Notifications must be sent to eligible approvers when request enters their stage.

How system knows “who can approve”:
- Not by “having many permissions”.
- By workflow definition:
  - Each stage includes approver selectors: role IDs and/or user IDs.
  - Additionally require a permission like `platform.approvals.approve` (SYSTEM scope) to access Approvals module actions.

2.7 Notifications (real-time + fallback)
- Implement notification events for:
  - Approval created
  - Stage advanced
  - Approved/Rejected
  - Delegated/Escalated
- Real-time: WebSocket or SSE channel for logged-in users.
- Fallback: persisted notifications table + polling.
- UI: bell icon shows unread count; notifications deep-link to approval details.

2.8 Audit timeline (SOC2 evidence friendly)
- Every sensitive action logs:
  - who, what, when, before/after diff, correlation id, ip/user-agent, tenantId, scope
- Approval has a timeline UI:
  - created -> pending -> stage moves -> approved/rejected
- Export audit events as JSON/CSV.

2.9 Compliance auto-mapping (SOC2 / ISO)
Build a mapping table that ties:
- control -> evidence sources
Example evidence:
- RBAC policy doc snapshot
- Role approval logs
- Permission changes audit
- AccessDenied events
- Break-glass usage logs
Auto-export “Evidence Pack” (JSON first; PDF-ready later).

2.10 SoD conflict detector + risk scoring
- Define SoD rules for bank-grade examples:
  - Cannot approve own changes (maker != checker)
  - Billing invoice create vs approve cannot be same person/role
  - User admin vs audit admin separation
- Implement SoD validator:
  - On workflow config save
  - On role permission assignment
  - On approval routing (block if conflict)
Risk scoring engine:
- Each permission has risk weight.
- Each change request gets total risk => low/medium/high.
- High risk triggers:
  - additional approval stage
  - stronger auth requirement (2FA)
  - mandatory audit note

2.11 Export to Excel (enterprise)
- Provide a reusable Export service usable on any list page.
- Export must respect current filters/search/sort ALWAYS (SAP-style consistency).
- UX:
  - “Export” button opens modal:
    - Export scope: Current filtered results / All results / Selected rows (if selection enabled)
    - Columns selection
    - Format: XLSX/CSV
  - For high-risk exports (sensitive data):
    - Must create approval request before export (workflow-based)
- Backend export endpoint must:
  - accept same ListQuery payload used by list endpoints
  - run server-side query with same filters/sort
  - stream file
  - log export audit event (SOC2 evidence)

2.12 List Query Engine (search/filter/sort/pagination)
- SAP-grade deterministic query:
  - q (search), filters (structured), sort, page, limit
- Remove “Rows per page” UI toggle:
  - Use a fixed default limit (e.g., 15) unless a page explicitly requires different.
  - Allow backend maxLimit clamp (e.g., max 50).
- Ensure URL contains list state optionally:
  - Minimal: tab/subTab in URL MUST persist.
  - For list filters/search: choose policy:
    - either reflect in URL (recommended for admin deep links)
    - or store in local state, but then provide “shareable link” feature.
Pick one and implement consistently.

========================
3) REQUIRED FILE CLEANUP (REDUCE FILE SPRAWL)
========================
Goal: Reduce duplicated permission/menu logic. Consolidate.
Rules:
- One canonical permission slug source (generated file if needed).
- One menu definitions file per panel (admin vs tenant), but resolved through a shared engine.
- One route guard primitive reused everywhere.

Deliver:
- “delete plan” step-by-step list:
  - identify duplicated files (e.g., permission service vs permissions service duplicates)
  - mark which ones become wrappers
  - remove unused .js map artifacts from server/scripts output if accidentally committed
- migration safety checklist:
  - ensure no runtime breaks
  - ensure seed stays aligned with registry

========================
4) TESTING (MANDATORY)
========================
4.1 Unit tests (Jest)
- Permission normalization tests:
  - create-only implies read
  - update-only implies read
  - manage implies read
- Menu visibility tests:
  - curator-only => Users sidebar resolves to curators tab
  - users-only => resolves to users tab
  - both => default priority consistent
  - settings subTab only => resolves correctly
- getFirstAllowedRoute tests:
  - returns stable path, never null if any allowed exists

4.2 E2E tests (Playwright)
- Login + hydration no flicker of login page for authenticated sessions.
- Refresh does not send to access-denied incorrectly.
- Direct URL access to forbidden routes redirects to first allowed route.
- Approvals:
  - maker creates role change -> appears in approvals -> checker approves -> role active.
- Export:
  - export respects filters/sort/search
  - high-risk export triggers approval

4.3 Chaos tests (auth/RBAC)
- token refresh race
- permission set changes while navigating
- menu registry mismatch: verify safe failure (terminal deny, no partial UI leakage)

========================
5) OUTPUT FORMAT EXPECTATION
========================
Provide:
A) Concrete implementation plan (phased)
B) Exact file-by-file changes referencing real paths under client/ and server/
C) Final “Frozen Standards” 1-page: scope/prefix/tab registry rules
D) Diagrams (text-based):
   - Auth FSM
   - Approval -> Notification -> Audit timeline
   - Menu -> Route -> Permission reference
E) A “Definition of Done” checklist for verification

========================
6) DO IT NOW
========================
Start by:
1) Build/fix Settings tab/subTab registry (frozen).
2) Refactor menu visibility + firstAllowedPath resolution to use registry.
3) Fix route guards to wait for hydration (stop flicker/loops).
4) Add permission normalization (frontend+backend).
5) Fix Users/Curators submodule bug with tests.
6) Move role approvals out of roles list actions into Approvals module flow.
7) Implement notifications + audit timeline.
8) Implement export service respecting filters/sort/search with approval gating for high-risk.

Deliver code changes + tests + docs as specified.
