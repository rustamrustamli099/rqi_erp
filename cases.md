PHASE 14H — IDEAL ERP AUTHORIZATION RESTORATION (SAP PFCG / SINGLE DECISION CENTER)

ROLE
You are antigravity acting as a Principal SAP ERP / PFCG Architect + Senior System Auditor.
This is NOT a greenfield project. Do NOT re-architect previous decisions.
Goal is to restore FULL SAP-grade integrity and make this an “ideal ERP” authorization system.

NON-NEGOTIABLE LAWS
1) SINGLE DECISION CENTER:
   ALL decisions (navigation visibility, hierarchy, tab/subTab access, action visibility, default routing, URL canonicalization)
   MUST be decided in ONE place (backend Decision Center + Orchestrator output).
2) DUMB UI:
   Frontend MUST NOT check permissions, MUST NOT infer context, MUST NOT select defaults.
   Frontend renders ONLY resolved output returned from backend.
3) EXACT MATCH ONLY:
   Permission match = exact string match only. No inference.
4) CONTAINERS HAVE NO PERMISSIONS
5) ORDER-DEPENDENT LOGIC FORBIDDEN
6) Default routing ≠ visibility
7) Invalid URL → router fixes, not UI
8) PAGE AUTH OBJECTS (Z_*) + ACTVT semantics:
   Page visibility is governed by DISPLAY/READ (ACTVT=03). Actions are governed by ACTVT create/change/delete/export/etc.
   Sections use AND logic (ALL required actions must be allowed).
9) Transaction Code semantics:
   Routable pages must not be accessible without an explicit Z_* object policy.

AUDIT INPUT (KNOWN FAILURES TO FIX)
- Dual Decision Center exists: frontend makes decisions via navigationResolver / TAB_SUBTAB_REGISTRY / usePermissions / raw permissions[].
- Slug vocabulary drift exists between backend seed/registry and frontend registries.
- Page authorization coverage is incomplete; some pages rely on fallback/string mapping.
- authorized=true was observed as hardcoded/assumed in some flows.
- Some UI components still render actions (CRUD/export) without consuming pageState.actions.

PHASE 14H GOAL (MUST ACHIEVE)
There must exist EXACTLY ONE authorization decision path in the entire system:

DB permission slugs
  → EffectivePermissionsService (exact-match, scope-aware)
  → DecisionCenterService (pure, cache-unaware)
  → DecisionOrchestrator (cache wrapper only)
  → GET /decision/page-state/:pageKey (returns ONLY { authorized, sections, actions, canonicalPath? })
  → Frontend renders ONLY from these boolean flags

NO other path may decide visibility/actions.

====================================================
TASK STRUCTURE (DO IN ORDER) — EACH TASK ENDS WITH AUDIT
====================================================

TASK 0 — GLOBAL INVENTORY & BASELINE (READ-ONLY)
- Produce an inventory list of:
  (A) all places in frontend that reference permissions or can()/hasPermission()/permissions.includes()
  (B) all registries: action.registry.ts, action-keys.ts, TAB_SUBTAB_REGISTRY, navigationResolver
  (C) all Z_* page keys and current coverage
- Output a “Regression Map” table with file paths and risk level.

POST-TASK AUDIT 0 (MANDATORY)
- Confirm current state and list all violations with severity.
- NO code changes allowed in TASK 0.

----------------------------------------------------

TASK 1 — REMOVE/NEUTRALIZE FRONTEND DECISION POINTS (DUMB UI ENFORCEMENT)
Hard requirements:
- Frontend MUST NOT decide using:
  can(), canAny(), canAll(), hasPermission(), permissions.includes(), usePermissions for decisions.
- navigationResolver must NOT compute authorization from raw permissions arrays.
Action:
- Refactor or deprecate decision-making parts so UI becomes a renderer of resolved backend outputs.
- If some utilities must remain for legacy, they must become NO-OP / read-only and must NOT be used in domain components.

POST-TASK AUDIT 1
- Ripgrep proof:
  rg "can\\(|hasPermission\\(|hasAny\\(|hasAll\\(|permissions\\.includes\\(" client/src/domains client/src/app
  Must return ZERO matches in domain UI components.
- Confirm UI does not render 403/Forbidden based on permissions; UI may only show empty state or redirect based on authorized flag from pageState.

----------------------------------------------------

TASK 2 — CANONICAL VOCABULARY SYNC (BACKEND ↔ DB ↔ FRONTEND)
Hard requirements:
- There must be ONE canonical permission vocabulary: DB seed + backend registry.
- Frontend must use ONLY semantic keys (GS_*) and never technical slugs.
Action:
- Ensure action-semantic registry maps GS_* → technical permission slugs in backend.
- Ensure frontend action-keys.ts matches GS_* keys exactly (no drift).
- Remove/replace any frontend registry that uses technical slugs or stale prefixes.
- Fix known drift example: system.settings.user_rights.roles.* vs system.settings.security.user_rights.roles.*

POST-TASK AUDIT 2
- Provide a “Vocabulary Sync Table”:
  GS_* key | backend mapping slug | exists in DB? | used in UI?
- Must show zero mismatches.

----------------------------------------------------

TASK 3 — PAGE AUTHORIZATION OBJECTS (Z_*) COVERAGE = COMPLETE
Hard requirements:
- Every routable ERP page must have an explicit Z_* Page Authorization Object entry.
- PageState.authorized MUST be computed from READ/DISPLAY permission, never assumed or hardcoded.
- No fallback string manipulation to guess objects.
Action:
- Enumerate all pages/routes and create missing Z_* objects in page-objects registry.
- For each Z_* object define:
  - page READ permission (ACTVT=03)
  - sections (AND logic)
  - actions (GS_* boolean map)
- Ensure DecisionController/Orchestrator always resolves via registry, not by deriving keys.

POST-TASK AUDIT 3
- Prove “coverage complete”:
  list all routes/pageKeys and show each has a registry entry.
- Confirm authorized flag is never hardcoded.
- Confirm DecisionCenterService remains cache-unaware.

----------------------------------------------------

TASK 4 — UI ACTION RENDERING ALIGNMENT (CRUD/EXPORT/TABLE/TOPBAR)
Hard requirements:
- Buttons, table row actions, toolbar actions (Add, Export to Excel, Delete, Update, Impersonate, Invite, etc.)
  must be driven ONLY by pageState.actions[GS_*] booleans.
- UI must not infer “if read then allow export” etc.
Action:
- Choose 3 representative complex screens (Users, Curators, Tenants) and verify end-to-end.
- Then roll the same pattern across all remaining domains systematically.

POST-TASK AUDIT 4
- For each representative screen, provide:
  - pageKey
  - required GS_* actions
  - screenshots/notes of which buttons appear for role variants (READ-only, CREATE-only, EXPORT-only, ADMIN)
- Provide proof that UI has zero permission checks.

----------------------------------------------------

TASK 5 — CI / LINT GUARDS (PERMANENT PROTECTION)
Hard requirements:
- Add ESLint/CI rules banning:
  can(), hasPermission(), hasAny(), hasAll(), permissions.includes() usage in domain UI.
- Add tests to ensure:
  - no domain UI imports usePermissions for decisions
  - no forbidden patterns exist
- These guards must prevent future regressions.

POST-TASK AUDIT 5
- Show CI/lint rule definitions and sample failure output.
- Confirm guards do not block decision infrastructure files (Decision Center internals allowed).

====================================================
FINAL DELIVERABLE — “IDEAL ERP CERTIFICATION REPORT”
====================================================
After TASK 0-5 PASS:
Provide a final report stating:
- SINGLE DECISION CENTER enforced
- DUMB UI enforced
- Z_* Authorization Objects complete
- GS_* semantic binding consistent
- T-Code semantics enforced at routing
- Zero parallel decision points
- Ready for Production Hardening (Phase 15)

IMPORTANT
- After EACH TASK, request an independent re-audit (self-audit) and include concrete proof.
- Do NOT proceed to the next task if audit fails.

START NOW WITH TASK 0.
END.
------------------------------------------------------------

PHASE 14H — TASK 1: FRONTEND BRAIN REMOVAL (SAP PFCG / IDEAL ERP MODE)

ROLE
You are antigravity acting as Principal SAP ERP / PFCG Architect + Chief Auditor.
This system must be SAP-grade, and stricter than SAP in auditability:
- ONE decision center only
- Dumb UI only
- No parallel engines
- No inference
- Exact match only

NON-NEGOTIABLE LAWS
1) SINGLE DECISION CENTER:
   All decisions about visibility/access/actions/routing are decided ONLY by backend:
   EffectivePermissionsService → DecisionCenterService → DecisionOrchestrator → API response.
2) DUMB UI:
   Frontend MUST NOT check permissions, infer context, decide routing, or decide actions.
   Frontend may ONLY render from backend outputs:
   - navigation tree (resolved)
   - pageState.authorized
   - pageState.sections
   - pageState.actions (boolean map)
3) EXACT MATCH ONLY:
   No inference, no implicit read, no OR shortcuts unless defined in Decision Center rules.
4) Z_* AUTH OBJECTS + ACTVT:
   Every routable page must have a Z_* Page Object.
   Page authorized MUST be computed, never assumed/hardcoded.

TASK 1 GOAL
Eliminate ALL frontend-side authorization decision points and enforce permanent guards to prevent regressions.

====================================================
TASK 1A — KILL / NEUTRALIZE DECISION ENABLERS (CRITICAL)
====================================================
Target files (from Task 0 regression map):
- client/src/app/auth/hooks/usePermissions.ts  (CRITICAL ENABLER)
- client/src/app/security/navigationResolver.ts (DUPLICATE BRAIN)
- client/src/app/routing/ProtectedRoute.tsx (CLIENT AUTH ROUTING)
- client/src/app/navigation/tabSubTab.registry.ts (SPLIT-BRAIN REGISTRY)

Required outcome:
- Domain UI must not import or call usePermissions for decisions.
- navigationResolver must not compute permissions-based visibility/actions.
- ProtectedRoute must not perform permission logic.
- tabSubTab.registry must be removed OR migrated to server canonical registries.

Constraints:
- Do NOT add new “helper decision engines” in frontend.
- Do NOT introduce caching or inference in frontend.
- UI must remain renderer only.

POST-TASK AUDIT 1A (MANDATORY)
Provide ripgrep proof (include commands + results):
rg "can\\(|hasPermission\\(|hasAny\\(|hasAll\\(|permissions\\.includes\\(" client/src
rg "usePermissions\\(" client/src/domains client/src/app
These MUST show:
- ZERO permission decision usages in domain UI components.
If any remain → FAIL and fix before proceeding.

====================================================
TASK 1B — MIGRATE UI TO CANONICAL PAGE STATE (RENDER ONLY)
====================================================
For every listed CRITICAL/HIGH file in regression map, refactor to consume:
- usePageState(pageKey) → { authorized, sections, actions }
and remove any local permission decisions.

Minimum targets (must be fixed in this task):
- NotificationRulesTable.tsx
- SettingsPage.tsx
- BillingPage.tsx
- UsersPage.tsx (ensure it uses pageState actions, not usePermissions)
- RoleManagementPage.tsx
- WorkflowEngineTab.tsx

Rules:
- No UI decision logic allowed.
- Do not render “403 Forbidden” based on permissions; use authorized=false as backend-provided state (empty state or redirect allowed).
- Buttons (Add / Export / CRUD / Row actions) must render ONLY from actions boolean map.

POST-TASK AUDIT 1B
Provide:
- Before/after list of files changed
- Proof that each file now uses pageState.actions/sections instead of permission checks
- Confirm no new hooks or registries introduced

====================================================
TASK 1C — PERMANENT CI / ESLINT GUARDS (NO REGRESSION)
====================================================
Implement strict guards:
- Ban usePermissions usage in domain UI (client/src/domains/**)
- Ban can()/hasPermission()/hasAny()/hasAll()/permissions.includes() in domain UI
- Ban importing tabSubTab.registry or any permission registry in domain UI
- Allow exceptions ONLY in backend decision infrastructure and platform-level code.

POST-TASK AUDIT 1C
Provide:
- ESLint rule selectors
- Example failing snippet + output
- Proof that platform decision code is not blocked

====================================================
FINAL TASK 1 CERTIFICATION
====================================================
Deliver a single “TASK 1 POST-TASK AUDIT REPORT” with:
- Confirmed: EXACTLY ONE decision center exists (backend)
- Confirmed: frontend contains zero authorization decision logic
- Confirmed: CI/Lint prevents reintroduction
- List remaining work (if any) ONLY for Phase 14H Task 2 (Z_* coverage)

Proceed now with TASK 1A.
Stop immediately if any audit fails.
END.
--------------------------------------------------

PHASE 14H — TASK 2
Z_* PAGE AUTHORIZATION OBJECTS & TRANSACTION CODE ENFORCEMENT

ROLE
You are antigravity acting as Chief SAP ERP / PFCG Architect and Final System Auditor.

This system must be:
- SAP PFCG compliant
- STRICTER than SAP where possible
- 100% Single Decision Center
- Frontend MUST NOT behave as a brain, guard, or backend surrogate

====================================================
NON-NEGOTIABLE CONSTITUTION (LOCKED)
====================================================

1) SINGLE DECISION CENTER
   - ALL authorization decisions (navigation, page access, sections, actions)
     are decided ONLY in backend:
       EffectivePermissionsService
         → DecisionCenterService
         → DecisionOrchestrator
         → API response

2) FRONTEND = DUMB RENDERER
   - Frontend MUST NOT:
     - check permissions
     - infer access
     - infer roles or scopes
     - compute visibility
     - block routes
     - act as a backend substitute
   - Frontend MAY ONLY:
     - render backend-resolved data
     - display empty states or redirects based on backend flags

3) SAP PFCG PAGE MODEL (MANDATORY)
   - EVERY routable page MUST have:
     - a Z_* Authorization Object
     - ACTVT semantics (READ / CHANGE / CREATE / DELETE / SPECIAL)
   - If Z_* object does NOT exist → PAGE IS NOT ACCESSIBLE
   - No implicit page access
   - No string-derived fallbacks

4) TRANSACTION CODE (T-CODE) EQUIVALENCE
   - Each page + primary action is equivalent to a T-Code
   - Access is deterministic and exact-match only
   - No UI inference or overrides

====================================================
TASK 2 GOAL
====================================================

Make Page Authorization Objects (Z_*) and Transaction Code semantics
FULLY CANONICAL, COMPLETE, and ENFORCED end-to-end.

====================================================
TASK 2A — Z_* PAGE OBJECT REGISTRY (CRITICAL)
====================================================

Create / complete a canonical registry:

server/src/platform/decision/page-objects.registry.ts

Requirements:
- Every routable page MUST be explicitly listed:
  Examples (not exhaustive):
  - /admin/dashboard        → Z_DASHBOARD
  - /admin/users            → Z_USERS
  - /admin/tenants          → Z_TENANTS
  - /admin/settings         → Z_SETTINGS
  - /admin/workflow         → Z_WORKFLOW
  - /admin/billing          → Z_BILLING

Each Z_* object MUST define:
- required ACTVT for page access (READ/DISPLAY)
- section visibility rules
- action semantic keys (GS_*)

NO FALLBACKS.
NO STRING INFERENCE.
Missing Z_* = HARD DENY.

POST-TASK AUDIT 2A
- List all routable pages
- Map each to a Z_* object
- Prove there are ZERO unregistered pages

====================================================
TASK 2B — DECISION CONTROLLER ENFORCEMENT
====================================================

DecisionController MUST:
- Resolve page authorization via Z_* object
- Compute:
  - authorized (boolean)
  - sections (Record<string, boolean>)
  - actions (Record<GS_*, boolean>)
- NEVER hardcode authorized = true
- NEVER assume JWT implies page access

If pageKey not registered → return NOT AUTHORIZED.

POST-TASK AUDIT 2B
- Show controller logic
- Prove unauthorized page access is blocked server-side

====================================================
TASK 2C — FRONTEND CONSUMPTION (NO LOGIC)
====================================================

Frontend MUST:
- Consume ONLY:
  usePageState(pageKey)
- Use ONLY:
  authorized, sections, actions
- NOT:
  - compute access
  - check permissions
  - check roles
  - use can(), hasPermission(), includes()

Rendering rules:
- authorized === false → redirect or empty state
- sections/actions === false → hidden UI

POST-TASK AUDIT 2C
- ripgrep proof:
  rg "can\\(|hasPermission\\(|permissions\\.includes" client/src
  MUST return ZERO domain hits

====================================================
TASK 2D — TRANSACTION CODE CONSISTENCY CHECK
====================================================

Verify:
- Backend action.registry.ts
- DB seeded permissions
- Frontend action-keys.ts

ALL semantic keys (GS_*) MUST:
- map to EXACT backend permission slugs
- exist in DB
- be used consistently

POST-TASK AUDIT 2D
- Table: GS_* → permission slug → DB row
- Report mismatches (if any)

====================================================
FINAL CERTIFICATION (MANDATORY)
====================================================

Produce:
PHASE 14H — TASK 2 POST-TASK AUDIT REPORT

Must explicitly state:
- "Every page has a Z_* Authorization Object"
- "Frontend contains ZERO authorization logic"
- "System enforces SAP PFCG semantics deterministically"

If ANY violation exists → TASK FAILS.

Proceed with TASK 2A.
END.
---------------------------------------------------------------------------------
GEMINI /.gemini.md — KONSTİTUSİYA QEYDLƏRİ (ƏLAVƏ)

BUNU .gemini/GEMINI.md faylına sözbəsöz əlavə edin:

## FRONTEND CONSTITUTION — ABSOLUTE RULES

The Frontend is NOT a security layer.
The Frontend is NOT a decision engine.
The Frontend is NOT allowed to behave like a backend.

### STRICT PROHIBITIONS
The Frontend MUST NOT:
- check permissions
- infer access
- infer roles or scopes
- decide visibility or routing
- perform authorization logic
- act as a fallback for backend failures

Forbidden patterns (ANY usage is a violation):
- can(), hasPermission(), hasAny(), hasAll()
- permissions.includes(...)
- role or scope checks in UI
- client-side guards based on permissions
- navigationResolver logic

### ALLOWED FRONTEND BEHAVIOR
The Frontend MAY ONLY:
- render backend-resolved navigation
- render backend-resolved pageState
- display empty states or redirects based on backend flags
- send user intent (clicks, forms) to backend

### BACKEND SUPREMACY
Authorization is decided ONLY by:
- EffectivePermissionsService
- DecisionCenterService
- DecisionOrchestrator

This rule is ARCHITECTURALLY LOCKED.
Violations MUST fail CI and be rejected in review.

This system follows SAP PFCG semantics
and enforces a Single Decision Center without exception.