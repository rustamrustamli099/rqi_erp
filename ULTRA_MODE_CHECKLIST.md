You are Antygravity acting as a senior SAP / Oracle / Workday ERP architect.

GOAL
-----
Refactor the existing RBAC + Menu + Tabs system to SAP-grade behavior with:
- SINGLE frozen registry
- SINGLE resolver (single decision point)
- EXACT allowlist only
- ZERO prefix / normalization / inference logic
- NO UI redesign (UI stays exactly the same)
- NO optimistic rendering
- NO /access-denied flicker

This is a HARD REQUIREMENT.

--------------------------------------------------
SAP RULES (NON-NEGOTIABLE)
--------------------------------------------------
1. There MUST be exactly ONE source of truth:
   client/src/app/navigation/tabSubTab.registry.ts

2. There MUST be exactly ONE decision engine:
   client/src/app/security/navigationResolver.ts
   (or rbacResolver if already agreed)

3. ABSOLUTELY FORBIDDEN everywhere:
   - startsWith
   - includes
   - indexOf
   - regex base stripping
   - normalizePermissions
   - synthetic .read / .access inference
   - child-implies-parent
   - fallback to first tab without resolver decision

4. Visibility rule:
   IF it is visible → it MUST be actionable.
   If not actionable → it MUST NOT exist in DOM.

5. Tabs / subTabs / sub-subTabs:
   - Render ONLY what resolver explicitly allows
   - Unauthorized tabs MUST NOT render at all
   - URL manipulation MUST NOT expose DOM nodes

--------------------------------------------------
PHASE 1 — DELETE / NEUTRALIZE
--------------------------------------------------
Delete OR fully neutralize (no-op) ALL competing decision logic:

- client/src/domains/auth/utils/permissionPreviewEngine.ts
- client/src/domains/auth/utils/menu-visibility.ts
- client/src/app/security/route-utils.ts
- client/src/app/security/rbac.registry.ts
- settings.registry.ts
- settings-tabs.registry.ts
- Any normalizePermissions() anywhere
- Any verb stripping (.read/.create/etc)
- Any page-level permission logic inside pages

No partial deletes. If file stays, it must not decide anything.

--------------------------------------------------
PHASE 2 — SINGLE RESOLVER (MANDATORY)
--------------------------------------------------
navigationResolver MUST:
- Take (path, searchParams, exactPermissionsSet)
- Use ONLY tabSubTab.registry.ts
- Return ONE of:
  - { decision: "allow" }
  - { decision: "redirect", targetUrl }
  - { decision: "deny" }

Rules:
- NO redirects to /access-denied if redirect is possible
- /access-denied is TERMINAL ONLY
- NO secondary redirects
- NO guessing

--------------------------------------------------
PHASE 3 — ROUTING (CRITICAL)
--------------------------------------------------
ProtectedRoute MUST:
- Call resolver ONCE
- If redirect → Navigate directly to targetUrl
- If deny → render AccessDenied TERMINALLY
- NEVER Navigate to /access-denied and then somewhere else

RootRedirect MUST:
- Use resolver ONLY
- NEVER use preview engines or menu helpers

--------------------------------------------------
PHASE 4 — SIDEBAR
--------------------------------------------------
Sidebar MUST:
- Be generated ONLY from resolver output
- Menu item exists ONLY if resolver finds ≥1 allowed tab
- Menu link MUST point to resolver.firstAllowedTarget
- No approval injection via regex or base checks

--------------------------------------------------
PHASE 5 — PAGES (NO EXCEPTIONS)
--------------------------------------------------
UsersPage / SettingsPage / BillingPage / ConsolePage:

- DO NOT define local tab lists
- DO NOT check permissions directly
- Ask resolver for allowed tabs/subTabs
- Render ONLY allowed tabs
- Clamp activeTab/subTab to allowed list
- Unauthorized tabs MUST NOT exist in DOM

IMPORTANT:
Sub-subTabs (example: Settings → Dictionaries → Currency)
MUST be gated EXACTLY by registry requiredAnyOf.

--------------------------------------------------
PHASE 6 — SETTINGS DICTIONARIES (KNOWN BUG)
--------------------------------------------------
Fix DictionariesTab:
- Each subTab MUST check registry requiredAnyOf
- If user has ONLY currency permission:
  - Only Currency subTab exists
  - Others DO NOT render
- No redirect flicker
- No "Bu bölməni görmək üçün icazəniz yoxdur" for valid permission

--------------------------------------------------
PHASE 7 — CONSOLE (CURRENTLY 50% BROKEN)
--------------------------------------------------
Console MUST behave like SAP:

Example:
Console →
  Monitoring →
    Dashboard (only if permission exists)

If ONLY dashboard permission exists:
- Console visible
- Monitoring visible
- ONLY Dashboard tab visible
- NO other Monitoring tabs
- NO phantom main tab
- NO sub-subTabs rendered without permission

--------------------------------------------------
PHASE 8 — ACCESS DENIED FLICKER (MUST FIX)
--------------------------------------------------
Remove this anti-pattern COMPLETELY:
ProtectedRoute → /access-denied → / → redirect back

AccessDeniedPage MUST:
- Be terminal
- NEVER auto-redirect
- NEVER compute landing route

--------------------------------------------------
PHASE 9 — CI ENFORCEMENT
--------------------------------------------------
Add repo-wide guard:
Fail CI if ANY of these appear in auth/navigation/routing:
- startsWith(
- includes(
- normalizePermissions
- replace(/\.read
- permissionBase logic

--------------------------------------------------
PHASE 10 — ACCEPTANCE TESTS (MANDATORY)
--------------------------------------------------
E2E MUST PASS:

1. Users: only system.users.curators.read
   → Users menu
   → ONLY Curators tab
   → Users tab DOES NOT EXIST

2. Settings: only dictionary.currency.read
   → Settings → Dictionaries
   → ONLY Currency subTab exists

3. Console: only monitoring.dashboard.read
   → Console → Monitoring → Dashboard
   → NOTHING else visible

4. Invalid tab/subTab in URL:
   → Immediate redirect to first allowed
   → NEVER hit /access-denied

--------------------------------------------------
DELIVERABLES
--------------------------------------------------
- Code changes committed
- No UI redesign
- No new registries
- No duplicated logic
- SAP-grade behavior only

If ANY ambiguity exists:
DO NOT guess.
FOLLOW tabSubTab.registry.ts EXACTLY.

EXECUTE.
