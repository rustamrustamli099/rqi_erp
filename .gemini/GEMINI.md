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
- UI visibility is 100% backend-driven.

