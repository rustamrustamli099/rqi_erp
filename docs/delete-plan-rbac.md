# RBAC Delete Plan

## Overview
This document outlines the files deleted/deprecated as part of SAP-Grade RBAC refactor.

---

## Deleted Files

### Phase 1: Duplicate Registries
| File | Reason | Replaced By |
|------|--------|-------------|
| `rbac.registry.ts` | Duplicate | `tabSubTab.registry.ts` |
| `settings.registry.ts` | Used RBAC_REGISTRY | `getSettingsTabsForUI()` |
| `settings-tabs.registry.ts` | Duplicate | `tabSubTab.registry.ts` |

### Phase 2: Permission Helpers
| File | Reason | Replaced By |
|------|--------|-------------|
| `permission-preview.ts` | Used RBAC_REGISTRY | `permissionPreviewEngine.ts` |
| `permission-preview.engine.ts` | startsWith logic | TAB_SUBTAB_REGISTRY |

---

## Server Changes

### Removed Logic
| File | Line | Change |
|------|------|--------|
| `permission.service.ts` | 270-275 | `.access` synthesis removed |
| `permission.service.ts` | 264-268 | Parent read inference removed |

---

## Replacement Modules

### Single Source of Truth
**File:** `client/src/app/navigation/tabSubTab.registry.ts`

**Exports:**
- `TAB_SUBTAB_REGISTRY` - All pages/tabs/subTabs
- `ADMIN_PAGES` - Admin panel pages
- `TENANT_PAGES` - Tenant panel pages
- `canAccessPage()` - Check page access
- `getFirstAllowedTab()` - Get first allowed tab
- `buildLandingPath()` - Build landing URL
- `getSettingsTabsForUI()` - Settings page tabs

---

## Commit Order

1. **Commit 1:** Create `tabSubTab.registry.ts`
2. **Commit 2:** Refactor `usePermissions.ts` to EXACT match
3. **Commit 3:** Refactor `ProtectedRoute.tsx`
4. **Commit 4:** Update `SettingsPage.tsx`
5. **Commit 5:** Delete duplicate registries
6. **Commit 6:** Server `.access` synthesis removal
7. **Commit 7:** Add E2E tests + CI scripts

---

## Safety Checks

- [x] Build passes after each commit
- [x] No TypeScript errors
- [x] E2E tests created
- [x] CI scan script added

---

**Status: COMPLETE ✅**
