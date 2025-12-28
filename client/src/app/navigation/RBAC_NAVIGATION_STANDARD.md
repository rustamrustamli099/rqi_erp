# RBAC Navigation Standard (FROZEN)

**Version:** 1.0  
**Status:** FROZEN  
**Date:** 2025-12-28

---

## Single Source of Truth

**File:** `client/src/app/navigation/tabSubTab.registry.ts`

All visibility decisions must derive from this registry:
- Sidebar page visibility
- Tab/subTab visibility inside pages
- Route guard decisions
- Landing path computation

---

## Permission Matching Rules

### ✅ ALLOWED
```typescript
// EXACT base match
permBase === reqBase
```

### ❌ FORBIDDEN
```typescript
// Prefix matching
requiredPermission.startsWith(userPerm + '.')

// Child implies parent
userBase.startsWith(reqBase + '.')

// Synthesized .access
derivedPerms.add(`${currentPath}.access`)
```

---

## Visibility Rules

### Parent Page
- Visible IF at least one child tab is allowed
- Landing redirects to first allowed tab

### Tabs
- Visible ONLY if user has EXACT permission
- Siblings hidden if not explicitly allowed

### SubTabs
- Same rules as tabs
- Default subTab is first allowed

---

## Routing Rules

### URL Format
```
/admin/users?tab=curators
/admin/settings?tab=dictionaries&subTab=currency
```

### Guard Behavior
1. Parse page/tab/subTab from URL
2. Check canForTab(pageKey, tabKey, subTabKey)
3. If unauthorized → terminal /access-denied
4. If tab missing → redirect to first allowed

---

## Files

| Purpose | File |
|---------|------|
| Registry | `tabSubTab.registry.ts` |
| Menu Generator | `menu.definitions.ts` |
| Visibility Engine | `menu-visibility.ts` |
| Permission Hook | `usePermissions.ts` |
| Route Guard | `ProtectedRoute.tsx` |

---

**DO NOT MODIFY without architecture approval.**
