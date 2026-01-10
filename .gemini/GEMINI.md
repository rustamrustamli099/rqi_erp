# GEMINI CONSTITUTION
# SAP ERP / PFCG Authorization Law Book

This document is the LAW of the project.
Developers MUST follow it. No exceptions.

OBJECTIVE
Define what is ALLOWED and FORBIDDEN in this ERP system
according to SAP PFCG, Single Decision Center architecture.

────────────────────────────────────────
SECTION 1 — CORE PHILOSOPHY
────────────────────────────────────────
- Backend decides.
- Frontend obeys.
- UI is dumb.
- Default state = hidden.
- Authorization is binary.

────────────────────────────────────────
SECTION 2 — ARCHITECTURE BOUNDARIES
────────────────────────────────────────

### BACKEND (NestJS)
**ALLOWED:**
- Permission models
- Z_* page objects
- Action maps
- DecisionCenterService (ONLY ONE)
- Authorization logic
- Menu resolution
- Route authorization

**FORBIDDEN:**
- Multiple decision engines
- DryRun / simulation RBAC
- Owner / SuperAdmin bypass
- Prefix / wildcard permission matching

### FRONTEND (React)
**ALLOWED:**
- PageGate
- usePageState
- Rendering based on backend flags
- actionKey boolean checks

**FORBIDDEN:**
- permission.includes()
- permission trees
- permission slugs
- permission structure maps
- role logic
- owner logic
- permission inference
- local authorization decisions

### DATABASE
**ALLOWED:**
- Raw permission strings
- Role-permission relations
- No derived / inferred permissions

**FORBIDDEN:**
- Permission hierarchy encoding
- Implicit grants

────────────────────────────────────────
SECTION 3 — AUTHORIZATION RULES
────────────────────────────────────────
- Every route MUST have Z_*.
- Every route MUST be gated.
- Every UI action MUST be hidden unless explicitly allowed.
- Menu visibility ≠ Action permission.
- Tabs ≠ Authorization.

────────────────────────────────────────
SECTION 4 — FILE-LEVEL RULES
────────────────────────────────────────
**FORBIDDEN FILE TYPES IN CLIENT:**
- permission-slugs.ts
- permission-structure.ts
- simulator-engine.ts
- permission preview logic
- RBAC utils

Any such file = DELETE.

────────────────────────────────────────
SECTION 5 — AUDIT CHECKLIST (PHASE 15)
────────────────────────────────────────
- Single Decision Center? YES
- Shadow RBAC? NO
- All routes gated? YES
- UI default hidden? YES
- Read-only simulation clean? YES
- dist sanitized? YES

If ANY answer = NO → BUILD FAILS.

────────────────────────────────────────
SECTION 6 — FINAL STATEMENT
────────────────────────────────────────
This project follows SAP PFCG strictly.
Any deviation is a SEV-1 architectural violation.

----------------------------------------------------------------------------------
# OLD PROJECT NOTES & HISTORY
----------------------------------------------------------------------------------

---

## 10. FINAL LAW

If backend did not EXPLICITLY allow,   
frontend MUST NOT render.


----------------------------------------------------------------------------------
# PHASE 15: REMEDIATION PROTOCOLS (ARCHIVED INSTRUCTION)
----------------------------------------------------------------------------------

YOU ARE THE FINAL SAP ERP PHASE-15 REMEDIATION ENGINE.

OBJECTIVE
Bring the system to 100/100 SAP PFCG audit-safe compliance.
After this task, Codex MUST return GO.

NON-NEGOTIABLE RULES
- Exactly ONE Decision Center.
- No shadow RBAC engines.
- Default UI state = HIDDEN.
- Frontend NEVER decides.
- dist/ must contain NO forbidden logic.

TASKS (EXECUTE STRICTLY IN ORDER)

────────────────────────────────────────
1) SINGLE DECISION CENTER — HARD MERGE
────────────────────────────────────────
- Eliminate duplicate DecisionCenterService.
- There MUST be exactly ONE canonical DecisionCenterService.
- Merge or delete:
  server/src/platform/auth/decision-center.service.ts
- ALL authorization decisions (auth + menu + actions) MUST route through:
  server/src/platform/decision/decision-center.service.ts

- PermissionDryRunEngine MUST BE:
  - fully deleted from src
  - fully removed from dist
  - not referenced by any guard or service

FAIL if any dry-run / secondary permission evaluator remains.

────────────────────────────────────────
2) ROUTE-LEVEL AUTH — FINAL CLOSURE
────────────────────────────────────────
- Add Z_* + PageGate to:
  /branches
  /branches/:id

- These MUST use Z_BRANCHES.
- No routable path may exist without Z_* + PageGate.

────────────────────────────────────────
3) UI CONTENT AUTHORIZATION — DEFAULT HIDDEN
────────────────────────────────────────
For ALL UI elements (buttons, menus, tabs):

RULE:
If pageState.actions[actionKey] !== true
→ the UI element MUST NOT RENDER AT ALL.

Fix explicitly:
- BranchesPage: Hide action menu trigger if NO actions are allowed.
- NotificationRulesTable: “Bax / View” MUST render ONLY if an explicit action flag exists. Hide dropdown trigger if no actions allowed.
- SettingsPage: Tabs MUST be gated by pageState.actions or backend-provided section flags. Menu presence alone is NOT sufficient.

NO visual placeholders. NO disabled UI. HIDDEN means not rendered.

────────────────────────────────────────
4) DIST SANITIZATION
────────────────────────────────────────
- Rebuild dist.
- Verify NO DryRunEngine code exists in dist/.
- Verify no forbidden RBAC logic ships.

────────────────────────────────────────
5) FINAL SELF-CHECK
────────────────────────────────────────
Simulate READ-ONLY user.
CONFIRM:
- No action menu triggers visible.
- No “View / Edit / Approve / …” UI appears.
- Pages render only if authorized.

----------------------------------------------------------------------------------
# STRICTER CONSTITUTION PROMPT (VERSION 2)
----------------------------------------------------------------------------------

YOU ARE WRITING THE OFFICIAL .GEMINI.md (PROJECT CONSTITUTION).
This document is the LAW. It must be actionable and enforceable.
If code contradicts this document, code must change — not the document.

PROJECT GOAL
SAP PFCG-grade ERP:
- Single Decision Center (backend only)
- Frontend is a dumb renderer
- Default hidden UI
- Exact-match permissions only

========================================
1) CORE LAWS (Non-negotiable)
========================================
LAW-1: Backend decides. Frontend obeys.
LAW-2: Single Decision Center: exactly ONE canonical authorization engine in backend.
LAW-3: Default hidden: UI renders NOTHING actionable unless backend explicitly enables it.
LAW-4: Exact-match permission checks only for authorization/visibility decisions.
LAW-5: No bypass: Owner/SuperAdmin shortcuts are forbidden in runtime.
LAW-6: No shadow engines: no DryRunEngine, no simulators, no alternative evaluators.
LAW-7: “Menu visibility” and “Action permission” are different outputs; frontend must not infer one from the other.

========================================
2) SYSTEM ARCHITECTURE (Boundaries)
========================================

BACKEND (server/)
Allowed:
- Permission models, role-permission relations
- Z_* Page Objects registry (authorization objects)
- GS_* Action Keys registry (semantic action flags)
- DecisionCenterService (the ONLY decision engine)
- DecisionOrchestrator (composition + caching only)
- /decision/page-state endpoint: authoritative authorized + sections + actions
- /me/menu endpoint: authoritative resolved menu + defaultRoute

Forbidden:
- Any second “DecisionCenterService” in another folder/module
- Guards/services that perform independent permission logic for authorization/visibility
- DryRunEngine / PermissionDryRunEngine / simulation evaluators
- startsWith/wildcards/prefix matching for any gating
- Owner/SuperAdmin bypass logic (guards/controllers/services)

FRONTEND (client/)
Allowed:
- ProtectedRoute: authentication only
- PageGate: reads backend pageState.authorized and blocks render
- Rendering based only on:
  - pageState.authorized
  - pageState.sections flags
  - pageState.actions[GS_*] booleans
  - backend menu payload (already resolved)
- UI metadata only: labels/icons/order (NO slugs, NO permissions)

Forbidden (SEV-1):
- permissions.includes(), can/canAny/canAll, hasPermission
- permission slugs or permission structure maps in runtime bundles
- local resolveNavigationTree / local menu filtering / local tab visibility logic
- any “permission preview simulator” or RBAC simulation logic in client runtime
- Owner logic, “isOwner”, or any special-casing

DATABASE (prisma/)
Allowed:
- raw permission strings
- role-permission relation tables
Forbidden:
- permission hierarchy encoding
- implicit grants or derived permissions stored in DB

========================================
3) AUTHORIZATION CONTRACTS
========================================
- Every authenticated route MUST map to a Z_* object.
- Every authenticated route MUST be gated by PageGate (or explicit authorized check).
- Every actionable UI element MUST be controlled by GS_* flag from backend.
- Every tab/subtab/section MUST be controlled by backend (menu nodes and/or section flags).
- Frontend never decides visibility from raw permissions.

========================================
4) BANNED FILES / ARTIFACTS
========================================
Banned in client runtime (must be deleted or moved to docs with no imports):
- permission-slugs.ts
- permission-structure.ts
- simulator-engine.ts
- permission preview simulator components
- any RBAC utils that compute visibility/authorization

Banned in server runtime (must not exist in src OR dist):
- dry-run.engine.*
- PermissionDryRunEngine
- alternative permission evaluators
- duplicate decision-center services

========================================
5) ENFORCEMENT (CI / LINT / GREP)
========================================
CI must fail if any of these are found in runtime code:
- permissions.includes(
- can( / canAny( / canAll( / hasPermission(
- resolveNavigationTree(
- startsWith( used in gating contexts
- dry-run.engine in server/dist or server/src

Provide exact ESLint no-restricted-imports / no-restricted-syntax patterns
AND a grep checklist developers must run before merge.

========================================
6) PHASE 15 CHECKLIST (100/100 Exit Criteria)
========================================
[ ] Exactly ONE DecisionCenterService exists in backend, referenced everywhere.
[ ] No DryRunEngine / PermissionDryRunEngine in src or dist.
[ ] All authenticated routes have Z_* + PageGate enforcement.
[ ] All UI actions/tabs/sections are default hidden and enabled only by GS_* / sections.
[ ] Read-only user sees NO create/update/delete/approve/reject/export UI.
[ ] No owner/superadmin bypass logic anywhere in runtime.
[ ] No permission ontology files imported into client runtime.

========================================
7) FINAL STATEMENT
========================================
Any deviation is SEV-1. Fix the code, not this document.

