You are Antygravity. Apply a strict SAP-grade navigation authorization refactor.

GOAL (non-negotiable):
- Single Frozen Registry + Single Resolver + Exact Allowlist.
- NO prefix matching, NO startsWith permission inference, NO action-verb stripping, NO synthetic “read” grants.
- If UI item is visible, it MUST be actionable. Unauthorized tabs/subTabs must not render in DOM at all.
- No /access-denied flicker: do not navigate to /access-denied for recoverable cases (unauthorized tab/subTab). Only render terminal deny when the user has zero allowed targets for that page.

CONTEXT / CURRENT BUGS:
- Unauthorized tabs show; clicking them bounces to /access-denied briefly, then redirects to first allowed tab.
- Settings dictionaries shows many subTabs without permission gating (currency-only user still sees others).
- Users/curators scenario: if only curators permission exists, Users page/tab logic still misbehaves and redirects.
- Console improved but sub-subtabs still not permission-gated (shows all).
- Competing decision points still exist: normalizePermissions, usePermissions.can(), menu-visibility, useMenu injection, RootRedirect, page-local tab lists.

CANONICAL SOURCE OF TRUTH:
- client/src/app/navigation/tabSubTab.registry.ts must be the ONLY frozen registry.
- It must list: pages → tabs → subTabs with explicit requiredAnyOf permission arrays.
- This registry must be used by: Sidebar, ProtectedRoute, RootRedirect landing, and each Page’s tab/subTab rendering.

MANDATORY ARCHITECTURE CHANGE:
A) REMOVE ALL INFERENCE / NORMALIZATION
1) In tabSubTab.registry.ts:
   - Delete or disable any normalizePermissions that adds .read based on create/update/delete/manage/approve/export.
   - The only allowed transformation is: trim whitespace and dedupe. No synthetic permissions.
2) In client/src/app/security/rbacResolver.ts (if exists):
   - Remove any normalizePermissions and any base/verb stripping. Resolver must check exact permission strings only.

B) INTRODUCE ONE RESOLVER (single decision point)
Create a single module:
- client/src/app/security/navigationResolver.ts (or similar, choose one)
It must expose ONLY these pure functions (exact match only):
1) resolvePageByPath(pathname): returns pageKey or null (based on registry paths).
2) getAllowedTabs(pageKey, userPerms): returns ordered list of allowed tabKeys based on registry.requiredAnyOf EXACT checks.
3) getAllowedSubTabs(pageKey, tabKey, userPerms): returns allowed subTabKeys EXACT checks.
4) evaluateRoute(pathname, searchParams, userPerms):
   returns one of:
   - { decision: 'ALLOW', normalizedUrl }  (when tab/subTab is allowed)
   - { decision: 'REDIRECT', normalizedUrl } (when tab/subTab missing or unauthorized but another allowed exists)
   - { decision: 'DENY' } (when user has zero allowed tabs for that page)
Rules:
- If tab is missing: redirect to first allowed tab for that page.
- If tab is present but unauthorized: redirect to first allowed tab (NO /access-denied).
- If subTab is missing: redirect to first allowed subTab (if registry defines subTabs), else allow tab-only.
- If subTab present but unauthorized: redirect to first allowed subTab for that tab (NO /access-denied).
- If pageKey is null: fallback to DENY for protected areas (/admin/*), except truly public routes.

C) REWIRE EVERY CONSUMER TO RESOLVER OUTPUT
1) client/src/app/routing/ProtectedRoute.tsx
   - Must call evaluateRoute() exactly once.
   - On ALLOW: render children.
   - On REDIRECT: <Navigate to normalizedUrl replace /> (directly; never detour to /access-denied).
   - On DENY: render AccessDeniedPage as terminal (no auto-redirect).
   - Remove any legacy canAny/canAll fallback and remove requiredPermissions props for registry-backed pages.

2) client/src/app/routing/RootRedirect.tsx (or any “first route” logic)
   - Must use resolver to compute the first allowed target across pages.
   - Remove PermissionPreviewEngine usage and remove any legacy route-utils.
   - RootRedirect must never send to /access-denied unless user truly has zero allowed pages.

3) client/src/app/navigation/useMenu.ts + client/src/app/layout/Sidebar.tsx
   - Sidebar items must be page-level only (no nested sidebar redesign; preserve current UI layout).
   - For each page: show the menu item ONLY if resolver says that page has at least one allowed tab.
   - The sidebar link URL must be the resolver’s first allowed target (includes ?tab=...&subTab=... where applicable).
   - Remove approvals injection that bypasses permissions; approvals menu item must be treated like any other page based on registry permissions.

4) Page-level tab renderers MUST be driven from resolver output (no local permission logic):
   - client/src/domains/identity/views/UsersPage.tsx:
     Render ONLY allowed tabs from getAllowedTabs(pageKey=users,...).
     Do NOT keep a static tab list that includes unauthorized tabs.
     Also, do not mount unauthorized tab panels in DOM.
   - client/src/domains/settings/SettingsPage.tsx:
     Render ONLY allowed tabs from resolver.
     For Dictionaries tab: subTabs must be rendered only from resolver.getAllowedSubTabs().
     Fix: currency-only must see ONLY currency subTab; others must not appear in DOM.
   - client/src/domains/billing/BillingPage.tsx:
     Same rule: tabs visible only if allowed.
   - client/src/domains/system-console/ConsolePage.tsx (and its nested areas):
     Ensure subSubTabs are gated by resolver subTab allowlist (no “show all”).

D) ACCESS DENIED MUST BE TERMINAL (NO BOUNCE)
- client/src/domains/auth/views/AccessDeniedPage.tsx:
  Remove any useEffect that redirects authenticated users away from /access-denied.
  AccessDenied should be a terminal state with only “Çıxış” and maybe “Geri” is removed; no auto navigation.
- Also: prevent manual navigation to /access-denied for recoverable cases by fixing ProtectedRoute (REDIRECT vs DENY).

E) DELETE / DEPRECATE COMPETING SOURCES
Delete or fully deprecate (must not be imported anywhere):
- client/src/domains/auth/utils/menu-visibility.ts
- client/src/domains/auth/utils/permissionPreviewEngine.ts (and engine)
- client/src/app/security/route-utils.ts
- Any old registries already removed must stay removed.
- permission-slugs.ts must not be used for navigation allowlists. If kept, it’s only constants, not “who can see what”.

F) ACCEPTANCE CRITERIA (MUST PASS)
Manual acceptance (strict):
1) Curators-only user:
   - Sidebar shows Users.
   - Inside UsersPage only “Curators” tab exists. “Users” tab is not in DOM.
   - Navigating to /admin/users?tab=users instantly redirects to /admin/users?tab=curators WITHOUT /access-denied flicker.
2) Monitoring-dashboard-only user:
   - Sidebar shows Console → Monitoring landing.
   - Only Monitoring and only Dashboard inside it renders; other console tabs and sub-tabs not visible.
3) Dictionaries currency-only user:
   - Sidebar shows Settings → Dictionaries landing with subTab=currency.
   - Settings shows Dictionaries tab, and inside it only Currency subTab; country/city/etc do not render.
4) Any unauthorized tab click never briefly goes to /access-denied; it redirects directly to first allowed.
5) Zero-permission user: cannot enter app; gets terminal AZ message and no module/menu leaks.

G) TESTS
Add/Update Playwright E2E (existing ones are OK but must match no-flicker requirement):
- Assert URL never becomes /access-denied during unauthorized tab navigation.
- Assert unauthorized tabs are absent from DOM (not just disabled).
- Add console subSubTab scenario test.

DELIVERABLES
- navigationResolver.ts + unit tests
- ProtectedRoute.tsx updated
- RootRedirect updated
- useMenu/Sidebar updated (UI unchanged)
- UsersPage/SettingsPage/BillingPage/ConsolePage updated to render tabs/subTabs only from resolver allowlists
- Delete the competing files and remove imports
- Update docs: RBAC_NAVIGATION_STANDARD.md to state “single resolver, exact allowlist”

WORKSTYLE
- Make commits in small safe steps, but ensure the final branch fully satisfies the acceptance criteria above.
- Do not introduce any new registries or duplicated logic.
