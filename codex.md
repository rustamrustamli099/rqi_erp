diff --git a/docs/RBAC_REPO_WIDE_FORENSICS.md b/docs/RBAC_REPO_WIDE_FORENSICS.md
new file mode 100644
index 0000000000000000000000000000000000000000..973f199e8d87172ea221408b3ae1b8596a2fc3cd
--- /dev/null
+++ b/docs/RBAC_REPO_WIDE_FORENSICS.md
@@ -0,0 +1,41 @@
+# RBAC Forensics Report
+
+## Root Causes
+- **Permission synthesis remains active**: `normalizePermissions` in both the registry and `rbacResolver` still auto-adds read aliases for write/approve/export actions (and `.view` aliases), re-inflating a user's capability surface and letting tabs render when only child verbs are present.【F:client/src/app/navigation/tabSubTab.registry.ts†L47-L71】【F:client/src/app/security/rbacResolver.ts†L44-L71】
+- **Console page bypasses frozen registry**: `ConsolePage` asks `getAllowedTabs` with a non-existent page key (`admin.system-console`) while rendering a separate hardcoded `CONSOLE_TABS` array, so the resolver returns zero allowed tabs and UI renders unguarded labels/content with broken layout hierarchy.【F:client/src/domains/system-console/ConsolePage.tsx†L22-L117】【F:client/src/app/navigation/tabSubTab.registry.ts†L243-L258】
+- **Multiple competing truth sources**: menu visibility, permission preview, and page-level tab renderers each run their own normalization and tab lists (registry normalization vs. resolver normalization vs. local constants), creating inconsistent visibility/actionability and redirect computation paths.【F:client/src/app/navigation/tabSubTab.registry.ts†L47-L71】【F:client/src/app/security/rbacResolver.ts†L44-L71】【F:client/src/domains/auth/utils/permissionPreviewEngine.ts†L21-L72】
+- **Route guards fall back to legacy checks off-registry**: `ProtectedRoute` still allows legacy `canAny/canAll` when a path is not found in the registry, causing /access-denied hops before RootRedirect re-routes, instead of immediate deterministic landing resolution from the registry alone.【F:client/src/app/routing/ProtectedRoute.tsx†L64-L116】
+
+## Concrete Offenders
+| File | Function/Block | Offending Condition | Why it breaks SAP invariant |
+| --- | --- | --- | --- |
+| `src/app/navigation/tabSubTab.registry.ts` | `normalizePermissions` | Adds synthetic `.read` for any write/manage/delete/export/approve actions | Introduces implicit access so unauthorized tabs still render; violates “exact match only” & visibility==actionability. 【F:client/src/app/navigation/tabSubTab.registry.ts†L47-L71】 |
+| `src/app/security/rbacResolver.ts` | `normalizePermissions` | Adds `.read` for write-like verbs and `.view` aliasing | Causes permission inflation in guards/root-redirect; unauthorized tabs become "allowed" and mis-computed first-route. 【F:client/src/app/security/rbacResolver.ts†L44-L71】 |
+| `src/domains/auth/utils/permissionPreviewEngine.ts` | `normalizePermissions` usage | Preview engine runs its own normalization rather than consuming frozen registry’s raw permissions | Divergent normalization means preview/devtools show tabs the guard won’t, keeping multiple sources of truth. 【F:client/src/domains/auth/utils/permissionPreviewEngine.ts†L21-L72】 |
+| `src/domains/system-console/ConsolePage.tsx` | `allowedTabKeys` + `CONSOLE_TABS` | Uses pageKey `admin.system-console` (not in registry) and local tab list | Resolver returns no allowed tabs; UI renders empty tab list and shows a sub-tab as a main tab with missing labels. 【F:client/src/domains/system-console/ConsolePage.tsx†L22-L117】【F:client/src/app/navigation/tabSubTab.registry.ts†L243-L258】 |
+| `src/app/routing/ProtectedRoute.tsx` | Registry-miss branch | If `getPageByPath` fails, falls back to legacy `canAll/canAny` and navigates to `/access-denied` | Produces flicker/bounce when page should resolve to first allowed tab directly via registry. 【F:client/src/app/routing/ProtectedRoute.tsx†L64-L116】 |
+
+## Console render bug
+- The registry declares `pageKey: 'admin.console'` with tab keys and required permissions, but `ConsolePage` calls the resolver with `pageKey: 'admin.system-console'` and renders a separate `CONSOLE_TABS` list. The resolver therefore returns an empty allowed set while the component still defaults to `currentTab === 'dashboard'`, so the tab bar disappears, the active content is misaligned, and a sub-tab can render as the only (main) tab with missing labels.【F:client/src/app/navigation/tabSubTab.registry.ts†L243-L258】【F:client/src/domains/system-console/ConsolePage.tsx†L22-L117】
+
+## AccessDenied flicker
+- When a route is missing from the registry, `ProtectedRoute` falls back to legacy permission props and returns `<Navigate to="/access-denied" ...>` on failure. RootRedirect then immediately recalculates landing from menu/preview engines, producing the observed /access-denied flash before bouncing to the first allowed tab. This bypasses the frozen registry resolver path that should compute a direct safe URL.【F:client/src/app/routing/ProtectedRoute.tsx†L64-L116】
+
+## Minimal patch set
+- **DELETE/DEPRECATE**: Remove all permission auto-expansion helpers (both `normalizePermissions` versions) in favor of raw exact sets; deprecate local `CONSOLE_TABS` in favor of registry-driven rendering.
+- **EDIT**: 
+  - `src/app/navigation/tabSubTab.registry.ts`: Delete normalization that synthesizes `.read`/aliases; expose raw registry only.
+  - `src/app/security/rbacResolver.ts`: Remove synthetic read/view aliasing; require exact permission membership.
+  - `src/domains/auth/utils/permissionPreviewEngine.ts` and any preview/devtools: consume the registry without re-normalizing or inferring permissions.
+  - `src/domains/system-console/ConsolePage.tsx`: Use registry pageKey `admin.console` and derive tabs directly from registry entries to keep labels/order consistent.
+  - `src/app/routing/ProtectedRoute.tsx`: Make registry lookup mandatory; on miss, treat as terminal 403 only if registry has no match and no allowed tabs—otherwise compute safe landing via resolver without intermediate /access-denied.
+- **ADD**: Central resolver module that exposes a single `resolveMenuAndLanding(permissions, context)` returning sidebar items, allowed tabs, and landing URL—used by sidebar, ProtectedRoute, RootRedirect, and preview tools.
+
+## Ordered implementation checklist
+1. **Freeze permission handling**: delete synthetic expansion in both `normalizePermissions` implementations; ensure all callers expect exact strings only.
+2. **Centralize resolver**: introduce shared resolver returning allowed menus/tabs/landing from the registry; refactor menu builder, preview engine, and ProtectedRoute to consume it.
+3. **Console alignment**: replace `CONSOLE_TABS` with registry-derived tabs and correct `pageKey` to `admin.console` so allowed tab computation matches guard redirects.
+4. **Guard behavior**: remove legacy `canAny/canAll` fallback in `ProtectedRoute`; if registry lacks the page or no tabs allowed, render terminal access-denied; otherwise redirect directly to first allowed tab without `/access-denied` hops.
+5. **Preview/devtools**: refactor permission preview to rely solely on the centralized resolver output (no independent normalization), guaranteeing parity with sidebar/tab rendering.
+6. **Settings/other pages**: audit remaining tab renderers to ensure they use registry-driven tab lists and guard decisions from the shared resolver; drop any residual hardcoded lists or permission slugs.
+7. **Regression check**: verify scenarios with only `system.users.curators.read`, only `system.system_console.monitoring.dashboard.read`, only `system.settings.dictionaries.currency.read`, and zero permissions all land on the expected first allowed tab or terminal 403 without flicker.
