ULTRA MODE — ENTERPRISE ERP FINALIZATION PROMPT
(SAP-GRADE / BANK-GRADE / AUDIT-READY)

You are acting as a Chief Software Architect + Security Auditor.
Your task is to FINALIZE, SIMPLIFY, and HARDEN the entire ERP system.

This is NOT a greenfield project.
This is a CONTINUATION.
DO NOT redesign randomly.
DO NOT introduce new patterns unless required to fix inconsistencies.

====================================================
REFACTOR STATUS: COMPLETED ✅
====================================================

## SAP-Grade RBAC Refactor (December 2024)

### Single Source of Truth
**FILE:** `client/src/app/navigation/tabSubTab.registry.ts`

This file now contains:
- TAB_SUBTAB_REGISTRY - All pages/tabs/subTabs
- ADMIN_PAGES - Admin panel pages with tabs
- TENANT_PAGES - Tenant panel pages
- canAccessPage() - Check page access
- getFirstAllowedTab() - Get first allowed tab
- buildLandingPath() - Build landing URL
- getSettingsTabsForUI() - Settings page tabs

### Files DELETED
- `client/src/app/security/rbac.registry.ts`
- `client/src/app/navigation/settings.registry.ts`
- `client/src/app/navigation/settings-tabs.registry.ts`
- `client/src/app/security/permission-preview.ts`
- `client/src/app/security/permission-preview.engine.ts`

### Files MODIFIED
- `usePermissions.ts` - EXACT match only, no startsWith
- `ProtectedRoute.tsx` - Uses TAB_SUBTAB_REGISTRY
- `menu.definitions.ts` - Flat sidebar, registry-driven
- `menu-visibility.ts` - Exact permission checks
- `SettingsPage.tsx` - Uses getSettingsTabsForUI()
- `permission.service.ts` - .access synthesis REMOVED

### Files ADDED
- `tabSubTab.registry.ts` - Single Source of Truth
- `TAB_SUBTAB_FROZEN_SPEC.md` - Registry specification
- `RBAC_NAVIGATION_STANDARD.md` - Navigation standard
- `docs/delete-plan-rbac.md` - Delete plan
- `e2e/rbac-users-curators-only.spec.ts`
- `e2e/rbac-console-monitoring-only.spec.ts`
- `e2e/rbac-settings-dictionaries-only.spec.ts`
- `e2e/rbac-no-permissions-terminal.spec.ts`
- `scripts/ci-prefix-auth-scan.ps1`
- `scripts/ci-prefix-auth-scan.sh`
- `server/scripts/seed-test-users.ts`

### Test Users Created
| Email | Permission |
|-------|------------|
| curators-only@test.com | system.users.curators.read |
| users-only@test.com | system.users.users.read |
| monitoring-only@test.com | system.console.monitoring.dashboard.read |
| dictionaries-currency@test.com | system.settings.system_configurations.dictionary.currency.read |
| no-permissions@test.com | (none) |

**Password:** `TestPassword123!`

====================================================
1. GLOBAL PRINCIPLES (NON-NEGOTIABLE)
====================================================

- Single Source of Truth for:
  - Permissions → `tabSubTab.registry.ts`
  - Menus → Generated from registry
  - Routes → ProtectedRoute uses registry
- No permission inference from UI state
- No hardcoded role bypasses (NO isOwner magic)
- Admin (SYSTEM) and Tenant scopes MUST be fully isolated
- EXACT permission checks ONLY - NO startsWith/prefix

====================================================
2. PERMISSION CHECKS (SAP-GRADE)
====================================================

ALLOWED:
- can(slugExact) - Exact match
- canAny([slugs]) - Any exact match
- canForTab(pageKey, tabKey) - Registry lookup

FORBIDDEN:
- startsWith() for permissions
- includes() for permissions
- Wildcard matching
- Parent-implies-child inference

NORMALIZATION (ONE PLACE ONLY):
- Write action (create/update/delete/export/approve) implies read
- Implemented in usePermissions.ts normalizeToBase()

====================================================
3. MENU SYSTEM — SAP STYLE (FLAT SIDEBAR)
====================================================

- Sidebar is FLAT
- NO submenus in sidebar
- ALL hierarchy is expressed via:
  - tabs
  - subTabs
  - URL query params

Example:
 /admin/settings?tab=dictionaries&subTab=currency

Rules:
- Page visible if ANY tab is allowed (exact check)
- Page navigates to FIRST allowed tab
- Tabs/subTabs filtered before render (not shown+redirect)

====================================================
4. PROTECTED ROUTE BEHAVIOR
====================================================

1) If auth loading: render skeleton
2) If not authenticated: redirect to /login
3) Resolve pageKey from pathname
4) Compute allowed tabs from TAB_SUBTAB_REGISTRY
5) If no allowed tabs: terminal /access-denied
6) If URL tab not allowed: redirect to first allowed tab
7) If URL subTab not allowed: redirect to first allowed subTab

NEVER render unauthorized content, not even briefly.

====================================================
5. ACCESS DENIED (TERMINAL STATE)
====================================================

AccessDenied page is TERMINAL:
- Only Logout is allowed
- No retry
- No redirect back
- Not directly accessible by URL

====================================================
6. SERVER CHANGES
====================================================

REMOVED from permission.service.ts:
- .access permission synthesis
- Parent read inference

KEPT:
- Write implies read (same resource only)

====================================================
7. E2E TESTS
====================================================

Run: `npx playwright test`

Tests verify:
- Unauthorized tabs NOT in DOM
- Click visible items never redirects to dashboard
- Invalid tab URL redirects to allowed tab
- No access-denied loop on refresh

====================================================
8. CI SCAN
====================================================

Run: `.\scripts\ci-prefix-auth-scan.ps1`

Detects:
- startsWith on permissions
- includes on permissions
- .access synthetic permissions

====================================================
9. VERIFICATION CHECKLIST
====================================================

```bash
# 1. Start servers
cd server && npm run start:dev
cd client && npm run dev

# 2. Login with test user
curators-only@test.com / TestPassword123!

# 3. Verify:
# - Only Curators tab visible
# - Users tab NOT in DOM
# - URL /admin/users?tab=users redirects to ?tab=curators

# 4. Run E2E tests
cd client && npx playwright test

# 5. Run CI scan
.\scripts\ci-prefix-auth-scan.ps1
```

====================================================
10. FINAL ACCEPTANCE CRITERIA ✅
====================================================

System is ACCEPTED:
- ✅ No access-denied redirect loops
- ✅ Menu clicks navigate correctly
- ✅ Unauthorized tabs NOT rendered
- ✅ Admin NEVER sees tenant UI
- ✅ Single Source of Truth established
- ✅ Prefix-based auth removed

END OF PROMPT

