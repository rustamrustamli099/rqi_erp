# SAP-Grade RBAC Refactor Report

## Summary
Comprehensive SAP-grade RBAC refactor completed. Single source of truth established.

---

## Changes Made

### 1. Frozen Registry ✅
**File:** `tabSubTab.registry.ts`
- All admin pages with tabs/subTabs
- EXACT permission slugs
- Helper functions: `canAccessPage`, `getFirstAllowedTab`, `buildLandingPath`

### 2. Files Deleted ✅
- `rbac.registry.ts`
- `settings.registry.ts`
- `settings-tabs.registry.ts`
- `permission-preview.ts`
- `permission-preview.engine.ts`

### 3. usePermissions ✅
- EXACT matching only
- `can()`, `canAny()`, `canForTab()` helpers
- NO startsWith/prefix

### 4. ProtectedRoute ✅
- TAB_SUBTAB_REGISTRY only
- Unknown tab → /access-denied
- Unauthorized → first allowed tab

### 5. Server ✅
- .access synthesis REMOVED
- Parent read inference REMOVED
- Only Rule 1: write implies read for same resource

---

## SAP Rules Enforced

| Rule | Status |
|------|--------|
| R1: Visible = Actionable | ✅ |
| R2: Unauthorized not rendered | ✅ |
| R3: EXACT checks only | ✅ |
| R4: Single source of truth | ✅ |
| R5: No synthetic permissions | ✅ |

---

## Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Curators-only | Only Curators tab visible |
| Monitoring-only | Only Monitoring Dashboard visible |
| Dictionaries-currency-only | Only Currency subTab visible |
| No permissions | Terminal /access-denied |

---

**Status: COMPLETE ✅**
