# SAP-Grade RBAC Full Audit Report

**Date:** 2025-12-28  
**Auditor:** Antigravity AI  
**Status:** 🔴 CRITICAL - 30+ violations

---

## 1. Executive Summary

The repository contains **significant SAP rule violations** across both client and server:

- **12+ startsWith** prefix checks in client permission logic
- **40+ .view slugs** in server that should be `.read`
- **3 competing registries** (RBAC_REGISTRY, SETTINGS_REGISTRY, TAB_SUBTAB_REGISTRY)
- **.access synthesis** in both client and server
- **Redirect loops** possible due to visibility/guard mismatch

**Risk Level: HIGH** - Unauthorized tabs can render and redirect loops exist.

---

## 2. Violation Table

### CLIENT VIOLATIONS

| File | Line(s) | Violation Type | Risk | Why Breaks SAP |
|------|---------|----------------|------|----------------|
| `rbac.registry.ts` | 292-325 | startsWith prefix | 🔴 | Grants sibling access |
| `permission-preview.engine.ts` | 62 | startsWith prefix | 🔴 | Parent inference |
| `permissions.normalize.ts` | 60 | .access synthesis | 🔴 | Synthetic permissions |
| `permissionPreviewEngine.ts` | 231,247 | startsWith | 🔴 | Bidirectional prefix |
| `settings.registry.ts` | 97 | startsWith | 🟠 | Duplicate registry |
| `permission-preview-engine.ts` | 78 | startsWith | 🔴 | Prefix check |
| `sod-rules.ts` | 279 | startsWith | 🟠 | SoD prefix logic |

### SERVER VIOLATIONS

| File | Line(s) | Violation Type | Risk | Why Breaks SAP |
|------|---------|----------------|------|----------------|
| `permission.service.ts` | 273 | .access synthesis | 🔴 | Generates non-DB perms |
| `permissions.ts` | 4-100+ | .view slugs | 🟠 | Should be .read |
| `permission-slug-map.ts` | 9-123 | .view mapping | 🟠 | Drift from canonical |
| `sod-rules.ts` | 155 | startsWith | 🔴 | Prefix match |
| `risk-scoring.ts` | 85 | startsWith | 🟠 | Scope detection |

---

## 3. DELETE / DEPRECATE List

### Client Files

| File | Action | Reason |
|------|--------|--------|
| `rbac.registry.ts` | **DELETE** | Replaced by TAB_SUBTAB_REGISTRY |
| `settings.registry.ts` | **DELETE** | Uses RBAC_REGISTRY |
| `permission-preview.engine.ts` | **DELETE** | Uses RBAC_REGISTRY + startsWith |
| `permission-preview.ts` | **DELETE** | Uses RBAC_REGISTRY |
| `permissions.normalize.ts` | **REFACTOR** | Remove .access synthesis |
| `permissionPreviewEngine.ts` | **DELETE** | startsWith prefix logic |
| `permission-preview-engine.ts` (settings) | **DELETE** | startsWith logic |

### Server Files

| File | Action | Reason |
|------|--------|--------|
| `permission.service.ts` | **REFACTOR** | Remove .access synthesis (lines 270-280) |
| `permissions.ts` | **REFACTOR** | Change .view → .read |
| `permission-slug-map.ts` | **REFACTOR or DELETE** | Normalize slugs |

---

## 4. KEEP & FREEZE - Canonical Registry

**File:** `client/src/app/navigation/tabSubTab.registry.ts`

```typescript
export const TAB_SUBTAB_REGISTRY = {
  admin: PageConfig[],
  tenant: PageConfig[]
}
```

**Rules:**
- All page/tab/subTab visibility MUST use this
- All route guards MUST use this
- All backend guards MUST align with this
- Export as JSON for seed generation

---

## 5. Minimal Fix Plan

### Phase 1: Client Cleanup
1. Delete `rbac.registry.ts`
2. Delete `settings.registry.ts`
3. Delete `permission-preview*.ts` files
4. Remove .access logic from `permissions.normalize.ts`

### Phase 2: Server Cleanup
1. Remove .access synthesis from `permission.service.ts` (line 273)
2. Change .view → .read in `permissions.ts`
3. Migrate database slugs if needed

### Phase 3: Verification
1. Test curators-only user
2. Test users-only user
3. Test settings subTab-only user
4. Test console monitoring-only user

---

## 6. Verification Checklist

### Manual Tests
- [ ] Login as curators-only → Only Curators tab visible
- [ ] Login as users-only → Only Users tab visible
- [ ] Click unauthorized URL → /access-denied
- [ ] No redirect loops on refresh

### E2E Tests
- [ ] Unauthorized tabs NOT in DOM
- [ ] First allowed tab is landing
- [ ] SubTab filtering works

---

**Report End**
