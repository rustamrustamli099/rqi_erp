# SAP-Grade RBAC Fail-Closed Checklist ✅

## STATUS: 100% COMPLETE

---

## Commit 1: Page-level auto-fallbacks ✅
- [x] ProtectedRoute handles all fallbacks
- [x] Pages don't auto-rewrite tabs

## Commit 2: ProtectedRoute fail-closed ✅
- [x] Unknown tab → terminal 403
- [x] Unauthorized tab → terminal 403
- [x] Unknown subTab → terminal 403
- [x] Unauthorized subTab → terminal 403
- [x] ONLY redirect: no tab in URL → first allowed

## Commit 3: Sidebar visibility ✅
- [x] Parent visible if ANY tab allowed
- [x] Only allowed descendants render

## Commit 4: Permission helpers ✅
- [x] can() - exact match
- [x] canForTab() - registry lookup
- [x] NO startsWith/includes

## Commit 5: E2E Tests ✅
- [x] curators-only: 403 for ?tab=users
- [x] settings: 403 for ?tab=smtp
- [x] settings: 403 for ?subTab=tax
- [x] no-permissions: terminal 403

---

## Behavior Summary

| Scenario | Action |
|----------|--------|
| No tab in URL | Redirect to first allowed |
| Unknown tab | Terminal 403 |
| Unauthorized tab | Terminal 403 |
| Unknown subTab | Terminal 403 |
| Unauthorized subTab | Terminal 403 |
| Zero allowed tabs | Terminal 403 |

---

**ALL COMMITS COMPLETE ✅**
