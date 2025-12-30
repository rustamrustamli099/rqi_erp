docs/RBAC_POST_COMMIT_SCAN_REPORT.md
New
+63
-0

# RBAC Post-Commit Scan Report (HEAD 80173c3be12341a25952c5d30dc9fbe763aabd6d)

## Executive Summary
- Multiple parallel “permission engines” (navigation registry helpers, rbacResolver, menu-visibility, preview simulators, and Settings page) add synthetic read/view permissions and strip verbs, violating the frozen-registry exact-match rule and causing tabs/subTabs to bounce or disappear incorrectly.
- UI surfaces (Settings, Billing, System Console Monitoring) render tabs/subTabs without resolver gating, so unauthorized items are present in the DOM and the resolver then redirects, producing the visible=>actionable break and the first-tab snap-back behavior.
- Root routing/menu assembly still uses inference (normalizePermissions, startsWith path matching, manual can() checks, approvals injection) instead of the single resolver output, leading to missing tabs for fully privileged users and false "no access" states for allowed Settings subsections.

## Top 15 Violations (forbidden patterns in scope)
| # | File | Function/Area | Lines | Snippet / Pattern | Why it violates SAP rule |
|---|------|---------------|-------|-------------------|-------------------------|
| 1 | client/src/app/navigation/tabSubTab.registry.ts | normalizePermissions | 51-70 | Adds `.read` whenever `.create/update/delete/manage/approve/export` present | Synthetic permission inference; must be exact allowlist only. |
| 2 | client/src/app/navigation/tabSubTab.registry.ts | hasExactPermission | 404-410 | `required.replace(/\.(read|create|update|delete|approve|export)$/,'');` | Verb stripping/base comparison instead of exact permission strings. |
| 3 | client/src/app/navigation/tabSubTab.registry.ts | getPageByPath | 433-438 | `pages.find(p => path.startsWith(p.basePath));` | startsWith matching to resolve pages; SAP spec requires exact base path. |
| 4 | client/src/app/security/rbacResolver.ts | normalizePermissions | 49-68 | `.view -> .read` alias + write implies read | Synthetic read inference and verb aliasing outside frozen registry. |
| 5 | client/src/domains/auth/utils/menu-visibility.ts | computeVisibleTree | 31-53 | normalizePermissions + startsWith context routing | Uses synthetic perms and path prefixing rather than resolver output. |
| 6 | client/src/domains/auth/utils/menu-visibility.ts | hasExactPermission | 87-99 | Regex verb stripping on required/actual perms | Base/verb stripping for decisions; not exact match. |
| 7 | client/src/domains/auth/utils/permissionPreviewEngine.ts | checkAccess | 227-238 | `req.replace(/\.(read|view|create|update|delete|export|approve)$/,'')` | Regex verb stripping to infer matches. |
| 8 | client/src/domains/auth/utils/permissionPreviewEngine.ts | findMatchingPerm | 247-256 | Same verb-stripping base compare | Synthetic matching instead of exact permission strings. |
| 9 | client/src/domains/settings/utils/permission-engine.ts | calculateUserAccess/processNode | 55-113 | Local menu walk uses `requiredPermissions.every(req => userPermissions.includes(req))` | Parallel decision point not using resolver/registry output; exposes unauthorized routes. |
|10| client/src/domains/settings/SettingsPage.tsx | Sidebar gating | 91-131 | Inline `can(item.permission)` on registry-derived single permission | Duplicates decision logic; ignores requiredAnyOf and resolver redirects causing false denies/missing tabs. |
|11| client/src/domains/billing/views/BillingPage.tsx | TabsList rendering | 329-378 | Renders all TabsTriggers while visibility only filtered in state | Unauthorized tabs remain in DOM; violates visible => actionable. |
|12| client/src/domains/system-console/monitoring/views/MonitoringTab.tsx | SubTab rendering | 9-52 | No resolver gating of monitoring subTabs; uses raw search params | Unauthorized sub-subtabs shown; resolver later snaps back. |
|13| client/src/app/navigation/useMenu.ts | Approvals injection | 54-74 | `permissions.includes('system.approvals.read')` to add menu item | Manual permission check outside resolver; creates duplicate decision point. |
|14| client/src/app/navigation/tabSubTab.registry.ts | getFirstAllowedTab | 371-398 | Uses normalizePermissions + hasExactPermission (verb stripping) | Redirect target derived from synthetic permissions; can mis-route. |
|15| client/src/domains/auth/utils/menu-visibility.ts | computeVisibleTree context | 31-38 | `menu.some(...startsWith('/admin'))` | Path-based inference to pick registry context; needs resolver-provided context.

## Critical Bug Reproduction & Root Cause
1. **Console sub-subtabs snap back / unauthorized visible**
   - Repro: In System Console → Monitoring, click a non-first subTab (alerts/anomalies/logs). URL briefly updates then returns to first subTab; unauthorized subTabs still render.
   - Root cause: MonitoringTab renders all subTabs without resolver gating (lines 9-52) while navigationResolver redirects unauthorized subTabs to first allowed, producing snap-back. No DOM filtering means unauthorized subTabs remain clickable.
2. **Settings Communication/Security tabs show unauthorized message for allowed users**
   - Repro: User with SMTP/SMS or SSO/SecurityPolicy permission clicks Settings → Communication/Security; sees "Bu bölməni görmək üçün icazəniz yoxdur." despite permission.
   - Root cause: SettingsPage uses `can(item.permission)` against a single permission from `getSettingsTabsForUI` (lines 91-106). That helper collapses requiredAnyOf to the first entry and Settings does not use resolver results; allowed alternates or subTab permissions are ignored, so tabs are hidden and URL fallback shows inline 403.
3. **Owner missing dictionaries & billing_config tabs**
   - Repro: Fully privileged user opens Settings; Dictionaries/Billing Config tabs absent from sidebar.
   - Root cause: Same SettingsPage manual gating plus `getSettingsTabsForUI` returning only the first required permission per tab and no subTab evaluation. If user perms don’t match that single slug (or require subTab-level checks), the tab is filtered out even though resolver would allow it.
4. **Unauthorized tabs appear and redirect to first allowed tab**
   - Repro: In Billing or Monitoring, devtools shows all tabs/subTabs; clicking an unauthorized one renders briefly then redirects to first allowed tab.
   - Root cause: BillingPage renders all TabsTriggers (lines 360-378) while only state uses filtered list; MonitoringTab renders all subTabs. ProtectedRoute/resolver then redirects, causing flicker and visible unauthorized elements contrary to SAP rule.

## Minimal Patch List (smallest first)
1. **Remove synthetic permission helpers**: Delete/disable normalizePermissions and hasExactPermission in `client/src/app/navigation/tabSubTab.registry.ts`; replace callers with resolver exact checks.
2. **Align rbacResolver/navigationResolver**: Strip normalization/verb aliasing in `client/src/app/security/rbacResolver.ts` and ensure evaluateNavigation uses exact registry permissions only.
3. **Menu/preview engines**: Refactor `client/src/domains/auth/utils/menu-visibility.ts` and `client/src/domains/auth/utils/permissionPreviewEngine.ts` to consume resolver outputs (allowed tabs/subTabs) without regex/startsWith logic.
4. **Settings gating**: In `client/src/domains/settings/SettingsPage.tsx`, render tabs via resolver (getAllowedTabs/getAllowedSubTabs) instead of `can()`/getSettingsTabsForUI; remove `permission-engine` usage and align sidebar data with registry resolver outputs.
5. **Page-specific tab rendering**: Gate tabs/subTabs in `client/src/domains/billing/views/BillingPage.tsx` and `client/src/domains/system-console/monitoring/views/MonitoringTab.tsx` using resolver results; ensure unauthorized tabs are not rendered and URLs use normalized resolver target.
6. **Menu assembly**: Update `client/src/app/navigation/useMenu.ts` to use resolver-provided approvals visibility and avoid manual permission checks.
7. **Path resolution**: Make `getPageByPath` exact-path only and ensure RootRedirect/ProtectedRoute rely solely on resolver landing computation.

## Single Decision Graph (intended flow)
1. **Input**: Auth context provides user permissions (no normalization) + context (admin/tenant).
2. **Registry lookup**: navigationResolver uses TAB_SUBTAB_REGISTRY (exact basePath match) to find page.
3. **Permission check**: resolver filters tabs/subTabs with exact string equality (no prefix/verb stripping).
4. **Outcome**:
   - If zero allowed tabs → terminal DENY.
   - If tab/subTab missing but alternatives exist → REDIRECT to first allowed target (no /access-denied hop).
   - If current tab/subTab allowed → ALLOW render.
5. **Consumers**: ProtectedRoute, RootRedirect, useMenu, and page components read only resolver outputs to render menu/tabs and compute navigation; no other permission engines.

## PR-Style Patch Checklist
- **Files to edit**: `client/src/app/navigation/tabSubTab.registry.ts`; `client/src/app/security/rbacResolver.ts`; `client/src/domains/auth/utils/menu-visibility.ts`; `client/src/domains/auth/utils/permissionPreviewEngine.ts`; `client/src/domains/settings/SettingsPage.tsx`; `client/src/domains/settings/utils/permission-engine.ts`; `client/src/domains/billing/views/BillingPage.tsx`; `client/src/domains/system-console/monitoring/views/MonitoringTab.tsx`; `client/src/app/navigation/useMenu.ts`; `client/src/app/routing/ProtectedRoute.tsx`; `client/src/app/routing/RootRedirect.tsx`.
- **Files to delete**: Any remaining duplicate permission engines once resolver wiring is complete (e.g., obsolete preview/permission-engine helpers if superseded).
- **Tests to add/modify**: Playwright end-to-end suites for (a) System Console Monitoring subTabs (ensure only allowed subTabs render and no snap-back), (b) Settings tabs visibility/landing for communication/security/dictionaries/billing_config with mixed permissions, and (c) Billing tabs visibility with unauthorized roles (no unauthorized tabs in DOM, direct landing to first allowed without /access-denied flicker).