# RBAC SAP Final Standard

## Invariants (Non-Negotiable)

### 1. Single Source of Truth
- `TAB_SUBTAB_REGISTRY` in `tabSubTab.registry.ts` is CANONICAL
- All other sources MUST use this registry

### 2. Exact Allowlist Only
```typescript
// ✅ ALLOWED
permBase === requiredBase

// ❌ FORBIDDEN
perm.startsWith(required)
perm.includes(required)
parent.implies(child)
```

### 3. Visible ⇒ Actionable
- Unauthorized tabs MUST NOT render in DOM
- No "click to see access denied"
- Filter BEFORE render, not after

### 4. No /access-denied Bounce
```
❌ WRONG: unauthorized tab → /access-denied → first allowed tab
✅ RIGHT: unauthorized tab → first allowed tab (direct)
```
- /access-denied is TERMINAL only when NO allowed target exists

### 5. Console Hierarchy
- Page → Tab → SubTab (if any)
- SubTab NEVER replaces Tab
- Maintain visual hierarchy

---

## Resolver API

File: `client/src/app/security/rbacResolver.ts`

```typescript
// Get allowed tabs for a page
getAllowedTabs({ pageKey, perms, context }): string[]

// Get allowed subTabs for a tab
getAllowedSubTabs({ pageKey, tabKey, perms, context }): string[]

// Resolve safe navigation target
resolveSafeLocation({ pathname, search, perms, context }): SafeLocationResult

// Check if result is terminal 403
isTerminal403(result): boolean
```

---

## Page Component Requirements

Every tabbed page MUST:

```typescript
// 1. Get allowed tabs from resolver
const allowedTabKeys = useMemo(() => {
    const permSet = normalizePermissions(permissions);
    return getAllowedTabs({ pageKey: 'admin.xxx', perms: permSet });
}, [permissions]);

// 2. Filter visible tabs
const visibleTabs = TAB_CONFIG.filter(t => allowedTabKeys.includes(t.key));

// 3. Render ONLY visible tabs
{visibleTabs.map(tab => <TabsTrigger key={tab.key} ... />)}
```

---

## ProtectedRoute Behavior

```
1) Auth loading? → Show skeleton
2) Not authenticated? → /login
3) Get page from registry
4) Call resolver for safe location
5) If terminal403 → AccessDenied (no redirect)
6) If redirect needed → Navigate directly (no /access-denied)
7) Render children
```

---

## AccessDenied Page

- TERMINAL only
- NO auto-redirect
- Logout button only
- Shows when user has ZERO allowed tabs

---

## Files Using Resolver

| File | Status |
|------|--------|
| `ProtectedRoute.tsx` | ✅ Uses resolver |
| `ConsolePage.tsx` | ✅ Resolver-driven |
| `BillingPage.tsx` | ✅ Resolver-driven |
| `UsersPage.tsx` | ✅ Resolver-driven |
| `SettingsPage.tsx` | Uses getSettingsTabsForUI |

---

## Removed/Deprecated

| File | Reason |
|------|--------|
| `startsWith` in checks | SAP violation |
| Auto-redirect in AccessDenied | Terminal only |
| PermissionSlugs in pages | Use resolver |

---

**STATUS: SAP-GRADE ENFORCED ✅**
