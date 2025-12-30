diff --git a/docs/RBAC_SAP_FINAL_REPORT.md b/docs/RBAC_SAP_FINAL_REPORT.md
new file mode 100644
index 0000000000000000000000000000000000000000..0521bdf8408950adec68e3f63ca64f8f13eeb112
--- /dev/null
+++ b/docs/RBAC_SAP_FINAL_REPORT.md
@@ -0,0 +1,51 @@
+# RBAC SAP Final Report
+
+## 1) Findings — Anti-Pattern Scan
+| File | Lines / Function | Pattern | Why it violates "single resolver + exact allowlist" | Fix Action |
+| --- | --- | --- | --- | --- |
+| `client/src/app/auth/utils/permissions.normalize.ts` | 1-66 (`normalizePermissions`) | Synthesizes parent `.read` and `.access` permissions via string splitting | Creates permissions not present in registry/DB, so guards can diverge from resolver outputs and render optimistic UI | Remove parent inference and `.access` synthesis; rely on canonical slugs and resolver normalization only |
+| `client/src/app/security/sod-rules.ts` | 270-285 (`hasPermission`) | Prefix-based permission matching (`startsWith`) | Treats sibling scopes as interchangeable, violating exact allowlist and letting unauthorized combinations pass SoD checks | Replace with exact base comparison using registry-normalized permissions |
+| `client/src/app/security/risk-scoring.ts` | 208-259 (`calculateScore`, `matchesPattern`) | Prefix checks for `system./platform.` and wildcard regex patterns | Risk scoring derives meaning from partial matches, drifting from registry truth and misclassifying access scope | Restrict scoring to explicit registry slugs without wildcards or prefix heuristics |
+| `client/src/app/security/route-utils.ts` | 1-55 (`getFirstAllowedRoute`) | Uses legacy menu trees with embedded `requiredPermissions` and returns `/access-denied` when none match | Duplicates navigation allowlist outside TAB_SUBTAB_REGISTRY; can disagree with resolver and cause intermediate `/access-denied` hops | Deprecate in favor of `resolveSafeLocation`/`getFirstAllowedTab`; compute landing from registry only |
+| `client/src/domains/billing/views/BillingPage.tsx` | 329-379 (`BillingPage`) | Renders all tab triggers while visibility list is computed separately | UI shows unauthorized tabs; clicking them triggers guard corrections and flicker | Drive tab render from resolver output (`visibleTabs`) and ignore query tabs not allowed |
+| `client/src/domains/system-console/ConsolePage.tsx` | 22-117 (`SystemCorePage`) | Local `CONSOLE_TABS` array + wrong `pageKey: 'admin.system-console'` | Duplicates registry and misses correct key (`admin.console`), producing empty allowed set → tabs hidden, mis-labeled rendering, and guard/redirect mismatches | Pull tabs from TAB_SUBTAB_REGISTRY entry for `admin.console`; use resolver outputs for both visibility and labels |
+
+## 2) /admin/console Route Forensic Trace
+- **Sidebar link generation:** `menu.definitions.ts` builds `/admin/console` from `TAB_SUBTAB_REGISTRY`.
+- **Route definition:** `admin.routes.tsx` wraps `/admin/console` with `ProtectedRoute`, so resolver expects `pageKey: admin.console`.
+- **Guard path:** `ProtectedRoute` calls `resolveSafeLocation` → uses registry entry for `admin.console` to compute allowed tabs.
+- **Page render:** `ConsolePage` computes `allowedTabKeys` using hard-coded `pageKey: 'admin.system-console'` and local `CONSOLE_TABS`. Because the key does not exist in the registry and the tab list is decoupled, `allowedTabKeys` is empty, so:
+  - Tabs list renders nothing; content falls back to `dashboard` regardless of permissions.
+  - Query params from guard (e.g., `?tab=monitoring`) are ignored, so a sub-tab can appear as the only tab.
+- **Root cause:** page-level resolver input (`pageKey`) and tab definitions ignore the frozen registry, flattening/losing labels and causing only one tab to render.
+- **Fix:** use `getPageByKey('admin.console')` to pull tabs/subTabs from registry, map labels/icons from that source, and feed those keys into resolver (`getAllowedTabs`, `getAllowedSubTabs`). Remove `CONSOLE_TABS` duplication and align query parsing with resolver output.
+
+## 3) Access-Denied Flicker Trace
+- When `ConsolePage` (or any page with mismatched registry key) computes no `allowedTabKeys`, `ProtectedRoute` sees zero allowed tabs from resolver and navigates to `/access-denied`.
+- `AccessDeniedPage` immediately redirects authenticated users back to `/`, where `RootRedirect` computes a landing route and sends them to the first allowed tab — producing the observed `/access-denied → first-tab` bounce.
+- Similar flicker can occur on `BillingPage` because unauthorized tabs are still clickable; the guard corrects after navigation instead of preventing the click.
+- **Fix:** ensure every page uses the exact registry key and resolver outputs to render tabs, and block unauthorized tab render/click entirely (render only `visibleTabs` and ignore invalid query params). Guards should redirect directly to the first allowed tab without hitting `/access-denied` unless no allowed tab exists.
+
+## 4) Ordered Patch Plan
+1) **Align console with registry**
+   - Edit `client/src/domains/system-console/ConsolePage.tsx` to read tabs/subTabs and labels from `TAB_SUBTAB_REGISTRY` (`admin.console`), and feed that config to `getAllowedTabs`/`getAllowedSubTabs`.
+   - Remove `CONSOLE_TABS` duplication and wrong `pageKey` string.
+2) **Hide unauthorized billing tabs**
+   - Edit `client/src/domains/billing/views/BillingPage.tsx` to render `TabsTrigger` from `visibleTabs` only and ignore URL tabs not in the allowlist.
+3) **Eliminate synthetic/legacy permission logic**
+   - Edit `client/src/app/auth/utils/permissions.normalize.ts` to drop parent inference and `.access` synthesis; keep only verb normalization consistent with resolver.
+4) **Replace prefix/wildcard checks**
+   - Edit `client/src/app/security/sod-rules.ts` and `client/src/app/security/risk-scoring.ts` to use exact registry slugs (no `startsWith`/wildcards) when evaluating permissions.
+5) **Deprecate duplicate navigation calculators**
+   - Refactor callers of `client/src/app/security/route-utils.ts` to rely on resolver outputs; either delete the file or gate it behind the registry to avoid conflicting allowlists.
+
+## 5) Verification Checklist
+- **Manual**
+  - Log in with only `system.system_console.monitoring.dashboard.read`: `/admin/console` renders Monitoring tab only; no other tabs visible; landing is `?tab=monitoring` with no `/access-denied` bounce.
+  - Log in with billing `licenses` permission only: Billing page shows only Licenses tab; clicking others is impossible.
+  - Attempt to open `/admin/console?tab=audit` without audit permission: immediate redirect to `?tab=<first-allowed>` without intermediate `/access-denied`.
+  - Zero-permission user hits `/` → `/access-denied` and stays there.
+- **Playwright**
+  - Assert unauthorized tab triggers are absent from DOM for billing and console pages when permissions lack those slugs.
+  - Navigate directly to unauthorized tab URLs and confirm URL rewrites directly to first allowed tab (no 403 hop).
+  - Verify console tabs render labels/icons matching registry entries and respect subTab query params from resolver.
