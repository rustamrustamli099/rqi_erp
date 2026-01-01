# GEMINI SYSTEM CONSTITUTION - SAP-GRADE ARCHITECTURE

> **WARNING: THIS FILE IS THE SUPREME LAW OF THE SYSTEM.**
> Violations of these rules, no matter how small, are rejected immediately.
> There are NO exceptions, NO temporary workarounds, and NO "features" that bypass these laws.

## 1. CORE PRINCIPLE: SINGLE DECISION CENTER

**LAW:** There is EXACTLY ONE Decision Center for the entire application.

It is implemented EXCLUSIVELY in:
- `resolveNavigationTree()` (Navigation Logic)
- `evaluateRoute()` (Routing Logic)

**THE DECISION CENTER ALONE DECIDES:**
- Navigation visibility (Menu Hierarchy)
- Tab / SubTab access
- Action visibility (CRUD, Workflow, Custom, Bulk)
- Default routing paths
- URL canonicalization

**VIOLATION:**
- The UI MUST NEVER decide visibility or access.
- The UI MUST NEVER filter menus or actions based on its own logic.
- Splitting decision logic into "hooks" or "utils" is FORBIDDEN.

---

## 2. SAP VISIBILITY LAW

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

**WHY:** Order-dependence creates "phantom access" bugs where moving a menu item changes security posture. This is unacceptable in ERP systems.

---

## 3. ACTION AUTHORIZATION LAW

**LAW:** Actions are treated as SAP Transaction Codes.

1. **1 Action = 1 Permission (EXACT MATCH).**
   - Action `create` -> Permission `ref.create`
   - Action `approve` -> Permission `ref.approve`

2. **NO Semantic Logic.**
   - No `OR`, `AND`, or `ANY` logic for a single action.
   - No fallback permissions ("if not create, try update").

3. **Resolution Location.**
   - Actions are resolved ONLY inside the Decision Center (`resolveNavigationTree`).
   - The UI receives a `ResolvedAction[]` list with `state: 'enabled' | 'disabled' | 'hidden'`.

**VIOLATION:**
- UI checking `can('create')` is FORBIDDEN.
- UI deriving "if I can see the page, I can read" is FORBIDDEN.

---

## 4. UI ROLE: DUMB RENDERER

**LAW:** The UI is a projection surface, not a brain.

**UI MAY:**
- Render the `resolvedNavigationTree` provided by the hook.
- Read `node.actions.byContext`.
- Render a button if `action.state !== 'hidden'`.
- Disable a button if `action.state === 'disabled'`.

**UI MUST NOT:**
- Check permissions (e.g., `usePermissions()`, `Set.has()`).
- Derive context (Current Page, Current Tab) from URL manually for decision purposes.
- Infer defaults (e.g., "If no actions, show read-only").
- Use hooks that "decide" visibility (e.g., `useVisibleActions`).
- Re-filter actions (e.g., `actions.filter(a => user.has(a.perm))`).
- Interpret route meaning (e.g., "admin/users implies System Scope").

**SPECIFIC BAN:**
- Adapters like `useCurrentRouteActions` that interpret routing to provide a "convenience" layer are FORBIDDEN. The UI must traverse the resolved tree or use router primitives to find its node.

---

## 5. ROUTING LAW

**LAW:** Routing is a centralized state machine.

1. **Centralized Decisions:**
   - `evaluateRoute` is the ONLY place that determines if a URL is valid.

2. **Invalid URLs:**
   - Fixed by the Router (Redirect / 404), NEVER by the UI.
   - The UI should never render a broken state; it should be redirected away before rendering.

3. **Default Routing:**
   - Automatic selection of the "First Allowed Child" happens ONLY when a specific child is not requested (e.g., visiting `/settings`).
   - Visibility of a parent must NEVER depend on which child is "default".

---

## 6. CONTEXT & SCOPE LAW

**LAW:** The Decision Center is Context-Agnostic but Scope-Aware.

1. **No Interpretation:**
   - The Decision Center does NOT guess context.
   - Arguments like `context: 'admin'` MUST be passed explicitly.
   - Arguments like `actionScope: 'system'` MUST be passed explicitly.

2. **No Inference:**
   - `admin` context DOES NOT imply `system` scope. (e.g., Tenant Admin).
   - `tenant` context DOES NOT imply `tenant` scope.
   - The Resolver trusts its inputs and does not transform them.

**WHY:** Inference creates coupling. In SAP systems, "Context" (Where I am) and "Scope" (What data I see) are modifying, orthogonal dimensions.

---

## 7. FORBIDDEN PATTERNS (BLACKLIST)

**THE FOLLOWING ARE BANNED FOREVER:**

1. **UI-Level Decision Hooks:** e.g., `useCanDoX()`, `useActionVisibility()`.
2. **Component Permission Checks:** e.g., `<Button disabled={!can('perm')} />`.
3. **Registry Access from UI:** Importing `ACTION_REGISTRY` in a `.tsx` file.
4. **Helper Deciders:** Functions like `isActionVisible(action)`.
5. **Multiple Decision Engines:** Separating "Menu Logic" from "Action Logic".
6. **Static Menus:** Hardcoded links bypassing the Resolver.
7. **"Tests Passed" as Proof:** A passing test on bad architecture is a bug in the test suite.

---

## 8. CODE HYGIENE (ENFORCED)

**LAW:** Code must be compilable, explicit, and free of placeholder logic.

1. **No Literal Placeholders:**
   - Literal placeholders such as `...` are **FORBIDDEN** in committed code.
   - Any placeholder must be replaced with valid executable logic before merge.
   - CI SHOULD fail builds containing invalid syntax placeholders.

2. **Rationale:**
   - Prevent silent compile-breakers in critical authorization paths.

---

## 9. WHY THIS EXISTS

This system is built to **SAP/Bank-Grade ERP Standards**.

- **Scale:** Small "convenience" violations scale into unmaintainable security holes.
- **Audit:** An auditor must look at **ONE** file to verify security. Distributed logic makes audit impossible.
- **Stability:** "Smart UI" is brittle. "Dumb UI" is robust.

**If behavior diverges from these laws, IT IS A BUG.**

---

## 10. CACHING STRATEGY (PHASE 10 — IN PROGRESS)

**LAW:** Caching must NEVER change authorization behavior.

### Cacheable Layers (Read-Only):

1. **Effective Permissions** (`flat string[]`)
   - Cache Key: `user:{id}:scope:{type}:{id}`
   - TTL: 5-15 minutes

2. **Decision Output**
   - Resolved navigation tree
   - Resolved actions
   - Canonical route
   - Cache Key: `user:{id}:context:{ctx}`

3. **Static Registries** (App Lifetime)
   - `ACTION_PERMISSIONS_REGISTRY`
   - `TAB_SUBTAB_REGISTRY`
   - `SOD_RULES`

### Hard Rules:

1. **Correctness-First Invalidation:**
   - Any role mutation → Invalidate affected caches
   - Any composite role mutation → Invalidate affected caches
   - Any user-role assignment mutation → Invalidate user cache

2. **NOT Cacheable (FORBIDDEN):**
   - JWT Token Validation
   - Session Context Switching
   - Real-time Impersonation State

3. **No Implicit Inference:**
   - Cached permissions are EXACT strings only
   - No `.read` inference from `.create`
   - Cache must mirror backend computation exactly

**VIOLATION:**
- Caching logic that alters authorization outcome is FORBIDDEN.
- Stale cache must fail-safe (deny access, not grant).

---

### PHASE 10.2 — Effective Permissions Cache (LOCKED)

**STATUS:** ✅ IMPLEMENTED

**CONSTRAINTS (IMMUTABLE):**

1. Cache ONLY wraps `EffectivePermissionsService.computeEffectivePermissions()` output.
2. NO authorization behavior change is allowed.
3. Cache keys are scope-explicit and deterministic:
   ```
   effPerm:user:{userId}:scope:{scopeType}:{scopeId|SYSTEM}
   ```
4. `DecisionCenterService` remains cache-UNAWARE.
5. TTL: 5 minutes (300 seconds).
6. Invalidation Methods:
   - `invalidateUser(userId)` — Clears all scopes for user
   - `invalidateScope(scopeType, scopeId)` — Clears all users in scope

**ANY DEVIATION INVALIDATES THE PHASE.**


