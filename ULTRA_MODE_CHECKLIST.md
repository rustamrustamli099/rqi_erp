# SAP-Grade RBAC Navigation Checklist ✅

## STATUS: 100% COMPLETE

---

## A) Repo-wide Audit ✅
- [x] startsWith/includes removed from auth paths
- [x] TAB_SUBTAB_REGISTRY is single source

## B) Canonical Helper API ✅
- [x] can() - exact match
- [x] canAny() - exact any
- [x] canForTab() - registry lookup
- [x] getFirstAllowedTab() - resolved route

## C) Kill the Flicker ✅
- [x] ProtectedRoute computes before render
- [x] /access-denied ONLY for terminal
- [x] Direct redirect for unauthorized tab

## D) Tabs Not Render Unauthorized ✅
- [x] UsersPage - registry-driven
- [x] SettingsPage - registry-driven
- [x] BillingPage - registry-driven

## E) Sidebar Behavior ✅
- [x] Flat sidebar
- [x] Page visible if ANY tab allowed
- [x] Click → first allowed route

## F) Sub-sub Menu (dictionaries) ✅
- [x] Registry complete

## G) E2E Tests ✅
- [x] curators-only: no flicker
- [x] settings-dictionaries: no flicker
- [x] no-permissions: terminal only

## H) Deliverables ✅
- [x] RBAC_NAVIGATION_STANDARD.md
- [x] TAB_SUBTAB_FROZEN_SPEC.md

---

**ALL TASKS COMPLETE ✅**
