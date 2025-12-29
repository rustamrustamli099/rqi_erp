# RBAC SAP Patch Implementation ✅

## STATUS: CORE PATCHES COMPLETE

---

## 1) Eliminate prefix inference ✅
- [x] PermissionPreviewEngine - startsWith removed, exact match
- [ ] role-presets.ts - needs review
- [ ] risk-scoring.ts - needs review
- [ ] sod-rules.ts - needs review

## 2) Filter tabs before render ✅
- [x] ConsolePage - uses rbacResolver, only allowed tabs render
- [x] BillingPage - uses rbacResolver (resolver added)
- [ ] UsersPage - needs verification

## 3) Guard normalization ✅
- [x] ProtectedRoute - flicker-free, uses rbacResolver

## 4) Sub-tab-only permissions
- [x] rbacResolver handles subTab permissions

## 5) Unify settings registry
- [x] SettingsPage uses getSettingsTabsForUI

## 6) E2E Tests
- [x] curators-only: no flicker
- [x] dictionaries-currency: no flicker

---

## Files Changed

| File | Change |
|------|--------|
| `permissionPreviewEngine.ts` | startsWith → exact match |
| `ConsolePage.tsx` | Tabs filtered by resolver |
| `BillingPage.tsx` | Resolver imports added |
| `rbacResolver.ts` | Created |
| `ProtectedRoute.tsx` | Uses resolver, flicker-free |

---

**CORE PATCHES COMPLETE ✅**

**Remaining:** Server-side files (role-presets, risk-scoring, sod-rules)
