# RQI ERP — GEMINI CONSTITUTION (GLOBAL STRUCTURE, A–Z)

> **Status:** ARCHITECTURALLY LOCKED  
> **Audience:** All contributors (Backend + Frontend + DevOps)

---

## 0) Prime Directive

This project is an **ERP-grade system**. Authorization is security-critical.

**Correctness > Convenience.**

---

## CRITICAL: FRONTEND MUST NOT ACT AS A BRAIN (ABSOLUTE BAN)

Frontend is NOT a security layer.
Frontend is NOT an authorization engine.
Frontend must NEVER behave like the backend.

### Forbidden (Build-Blocking)
Any occurrence in `client/src/**` is a violation and must fail CI:

- `can()`, `hasPermission()`, `hasAny()`, `hasAll()` — anywhere in domain/shared UI
- `permissions.includes(...)` used to control visibility or access
- permission-based `ProtectedRoute` or route gating
- any client-side navigation resolver that computes menu/tab visibility
- any permission inference (e.g., auto-add `.read` / `.view`)
- any fallback access when backend mapping is missing

### Allowed (Frontend Role)
Frontend may ONLY:
- fetch backend-resolved outputs:
  - ResolvedNavigationTree
  - ResolvedPageState `{ authorized, sections, actions }`
- render UI using only these flags
- show empty-state or redirect based on `authorized=false`
- send user intent (clicks/forms) to backend

### Backend Supremacy (Single Decision Center)
All authorization decisions MUST be computed ONLY by:
```
EffectivePermissionsService → DecisionCenterService → DecisionOrchestrator → API
```

### CI Guard Requirement
CI must enforce:
- 0 matches for forbidden patterns in `client/src/**`
- restricted imports: `usePermissions`, `navigationResolver`, registry-based auth
- restricted syntax: `permissions.includes`, `can(`, `hasPermission(`, etc.

**This is ARCHITECTURALLY LOCKED.**
**Reintroducing any frontend decision logic is a security regression.**

---

## 1) Single Decision Center (SDC) — ABSOLUTE LAW

There is **EXACTLY ONE** authorization decision center, on the backend.

All of the following MUST be decided ONLY by the backend Decision Center flow:
- navigation visibility (menus/tabs/subTabs)
- menu hierarchy
- page access (authorized/denied)
- section visibility
- action availability (CRUD, Export, Impersonate, Workflow actions)
- default routing / canonicalization

**Canonical backend flow:**
```
EffectivePermissionsService
  → DecisionCenterService (pure)
  → DecisionOrchestrator (glue + caching)
  → API response contracts
```

**Frontend is NEVER an authority.**

---

## 2) Frontend is a Dumb Renderer (NO BRAIN)

Frontend MUST NOT behave like a backend, guard, or decision engine.

### Forbidden in frontend (ANY occurrence is a violation)
- permission checks: `can()`, `hasPermission()`, `hasAny()`, `hasAll()`
- `permissions.includes(...)`
- role checks, scope checks, isOwner bypass logic
- "ProtectedRoute" decisions based on permissions
- client-side navigation resolver that computes visibility
- inferring permissions (auto-add read/view) or fallbacks

### Allowed frontend behavior
- Fetch resolved outputs from backend (navigation tree, pageState)
- Render UI conditionally using backend-provided flags:
  - `pageState.authorized`
  - `pageState.sections`
  - `pageState.actions` (boolean map)
- Redirect / empty state based on backend flags ONLY

**Frontend may never "deny" or "allow" by computing permissions.**

---

## 3) SAP PFCG Authorization Model — Exact Match Only

- Permission match is **EXACT string match** only.
- No inference, no implicit read/view, no "write implies read".
- Containers never have permissions.
- Parent visible if ANY child visible.
- Order-dependent logic is forbidden.

---

## 4) Z_* Page Authorization Objects (Mandatory)

Every routable page MUST have a **Z_* Page Authorization Object** entry.
Missing Z_* object => `authorized=false` (hard deny).
No string-derived fallback for page keys.

Z_* objects define:
- page access rule (ACTVT=DISPLAY/READ)
- section requirements
- action semantic keys (GS_*), bound to technical permission slugs via registry

---

## 5) Transaction Codes (T-Code equivalence)

Each routable page and its primary operations are equivalent to SAP T-Codes:
- Deterministic access
- Backend enforced
- Auditable in one place

No UI-side "soft T-code".

---

## 6) Canonical Registries (Single Source of Truth)

**Backend is canonical for authorization registries:**
- action registry (semantic → technical slugs)
- page objects registry (Z_* coverage)
- decision center rules

**Frontend may have ONLY:**
- action key constants (semantic GS_* identifiers)
- typing contracts (ResolvedPageState)

But **not** decision logic.

---

## 7) Caching Boundaries (Read-only correctness preserved)

Cache is allowed ONLY as transparent wrappers:
- Effective permissions cache (Phase 10.2)
- Decision results cache (Phase 10.3)
- Invalidation hooks (Phase 10.4)

`DecisionCenterService` remains cache-unaware (pure).
Caches must be scope-explicit and never leak across tenants.

---

## 8) Observability is Read-only

Logging/audit/metrics MUST NOT change authorization behavior.
Never log secrets (JWT/cookies/passwords). Redact aggressively.

---

## 9) Folder Responsibilities (Canonical Map)

### Backend (NestJS)
| Path | Responsibility |
|------|----------------|
| `server/src/modules/**` | Domain modules (IAM, Tenants, Users, etc.) |
| `server/src/platform/decision/**` | DecisionCenterService, page-objects.registry, action.registry |
| `server/src/platform/cache/**` | Cache abstractions + invalidation services |
| `server/src/system/audit/**` | Audit logging module |
| `server/src/platform/observability/**` | Metrics/logging glue |

### Frontend (React)
| Path | Responsibility |
|------|----------------|
| `client/src/domains/**` | UI + API calls ONLY (renderer) |
| `client/src/shared/**` | UI primitives ONLY (no auth logic) |
| `client/src/app/security/**` | Contracts + hooks that FETCH resolved state (no computations) |
| `client/src/app/navigation/**` | Constants (action keys), no permission decisions |

---

## 10) Enforcement (CI/ESLint)

CI MUST fail if forbidden patterns reappear in frontend.
Approved exceptions are ONLY in backend decision infrastructure.

**This constitution is LOCKED.**
**Any violation is a build blocker.**

---

# LEGACY SECTIONS (Preserved for Reference)

## SAP VISIBILITY LAW

**LAW:** Visibility logic is structural and permissions-driven ONLY.

1. **Permissions belong to Nodes, NOT Containers.**
   - A container (Page/Group) has NO permissions of its own.

2. **Parent Visibility Rule:**
   - A parent is VISIBLE if and only if ANY child is visible.
   - If all children are hidden, the parent MUST generally be hidden (unless specifically permissionless).

3. **Order-Independence:**
   - Visibility calculations MUST be order-independent.
   - `children[0]` logic is FORBIDDEN for determines visibility or defaults during resolution time.
   - `firstAllowed` logic is managed ONLY by the router for redirection, never for data structure generation.

---

## ACTION AUTHORIZATION LAW

**LAW:** Actions are treated as SAP Transaction Codes.

1. **1 Action = 1 Permission (EXACT MATCH).**
   - Action `create` -> Permission `ref.create`
   - Action `approve` -> Permission `ref.approve`

2. **NO Semantic Logic.**
   - No `OR`, `AND`, or `ANY` logic for a single action.
   - No fallback permissions ("if not create, try update").

3. **Resolution Location.**
   - Actions are resolved ONLY inside the Decision Center.
   - The UI receives a `ResolvedAction[]` list with `state: 'enabled' | 'disabled' | 'hidden'`.

---

## FORBIDDEN PATTERNS (BLACKLIST)

**THE FOLLOWING ARE BANNED FOREVER:**

1. **UI-Level Decision Hooks:** e.g., `useCanDoX()`, `useActionVisibility()`.
2. **Component Permission Checks:** e.g., `<Button disabled={!can('perm')} />`.
3. **Registry Access from UI:** Importing `ACTION_REGISTRY` in a `.tsx` file.
4. **Helper Deciders:** Functions like `isActionVisible(action)`.
5. **Multiple Decision Engines:** Separating "Menu Logic" from "Action Logic".
6. **Static Menus:** Hardcoded links bypassing the Resolver.
7. **"Tests Passed" as Proof:** A passing test on bad architecture is a bug in the test suite.

---

## CACHING STRATEGY (PHASE 10 — COMPLETED ✅)

**LAW:** Caching must NEVER change authorization behavior.

### Cacheable Layers (Read-Only):

1. **Effective Permissions** (`flat string[]`)
   - Cache Key: `effPerm:user:{userId}:scope:{scopeType}:{scopeId|SYSTEM}`
   - TTL: 5 minutes

2. **Decision Output**
   - Cache Key: `decision:user:{userId}:scope:{scopeType}:{scopeId|SYSTEM}:route:{routeHash}`
   - TTL: 5 minutes

3. **Static Registries** (App Lifetime)
   - `ACTION_PERMISSIONS_REGISTRY`
   - `TAB_SUBTAB_REGISTRY`
   - `PAGE_OBJECTS_REGISTRY`

### Hard Rules:

1. **Correctness-First Invalidation:**
   - Any role mutation → Invalidate affected caches
   - Any user-role assignment mutation → Invalidate user cache

2. **NOT Cacheable (FORBIDDEN):**
   - JWT Token Validation
   - Session Context Switching
   - Real-time Impersonation State

---

## CODE HYGIENE (ENFORCED)

**LAW:** Code must be compilable, explicit, and free of placeholder logic.

1. **No Literal Placeholders:**
   - Literal placeholders such as `...` are **FORBIDDEN** in committed code.
   - CI SHOULD fail builds containing invalid syntax placeholders.

---

## WHY THIS EXISTS

This system is built to **SAP/Bank-Grade ERP Standards**.

- **Scale:** Small "convenience" violations scale into unmaintainable security holes.
- **Audit:** An auditor must look at **ONE** file to verify security.
- **Stability:** "Smart UI" is brittle. "Dumb UI" is robust.

**If behavior diverges from these laws, IT IS A BUG.**

# RQI ERP — SAP PFCG Canonical Architecture Constitution

## 1. Core Philosophy
This system follows SAP PFCG-grade authorization.
Authorization is only real if UI obeys backend decisions.
Backend decides.
Frontend renders.

## 2. Single Decision Center (SDC)
There MUST be exactly ONE decision center:
- Backend
- DecisionCenterService
- DecisionOrchestrator
- PAGE_OBJECTS_REGISTRY (Z_*)
- ACTION_REGISTRY (GS_*)

Frontend is NOT a decision layer.

## 3. Frontend Brain Ban (CRITICAL)
Frontend MUST NEVER:
- check permissions
- compute visibility
- infer authorization
- decide routing
- compute menus or tabs

Forbidden in frontend runtime:
- permissions.includes
- resolveNavigationTree
- can / canAny / canAll
- startsWith permission logic
- local visibility booleans

Violations = SECURITY BUG.

## 4. Page Authorization Rule
Every routable page MUST:
- have a Z_* page object
- be enforced by PageGate or usePageState.authorized

If a page renders without authorization check → INVALID.

## 5. Page Content Authorization Rule
UI elements:
- buttons
- tabs
- row actions
- sections
- toolbars

MUST:
- be hidden by default
- render ONLY if backend pageState.actions[key] === true

Read-only users MUST NOT see write UI.

## 6. Exact-Match Authorization Only
Authorization rules:
- EXACT string match only

Forbidden:
- prefix matching
- wildcard matching
- inference
- auto-added permissions

Analytics may use prefix logic,
Authorization may NOT.

## 7. Menu & Navigation
Menus, tabs, default routes MUST:
- be resolved in backend
- be delivered as data
- NEVER filtered in frontend

Frontend renders backend-provided structure ONLY.

## 8. No Temporary Bypasses
Temporary frontend logic is NOT allowed.
If backend is broken:
- FIX BACKEND
- NEVER bypass with frontend logic

## 9. CI & Guardrails
CI MUST block:
- frontend permission logic
- missing PageGate
- missing Z_* coverage
- multiple decision centers

## 10. Audit Truth
If:
- Read-only user sees write UI
- Frontend decides anything
- Page renders without authorization

Then:
System is NOT SAP PFCG compliant.
