# RBAC SAP Final Implementation

## Invariants

### 1. Single Source of Truth
**File:** `client/src/app/navigation/tabSubTab.registry.ts`

This is the ONLY source for:
- Page → Tab → SubTab structure
- Required permissions (requiredAnyOf arrays)
- URL schema (basePath, tab key, subTab key)

### 2. Single Resolver
**File:** `client/src/app/security/rbacResolver.ts`

All authorization decisions MUST use this resolver:
- `getAllowedTabs()` - get tabs user can access
- `getAllowedSubTabs()` - get subTabs user can access
- `evaluateNavigation()` - single decision: allow/redirect/deny
- `firstAllowedTarget()` - for sidebar links

### 3. Exact Allowlist Only
```typescript
// ✅ CORRECT - exact equality
requiredAnyOf.some(p => perms.has(p))

// ❌ FORBIDDEN
perm.startsWith(required)
perm.includes(required)
parent.grants.child
```

### 4. Visible ⇒ Actionable
- If tab is visible, user CAN click it
- If user CAN'T access, tab MUST NOT render
- No "click to see access denied"

### 5. No Access-Denied Bounce
```
❌ WRONG: /admin/users?tab=users → /access-denied → /admin/users?tab=curators
✅ RIGHT: /admin/users?tab=users → /admin/users?tab=curators (direct)
```

---

## Files Edited

| File | Change |
|------|--------|
| `rbacResolver.ts` | Added `evaluateNavigation`, `firstAllowedTarget` |
| `ProtectedRoute.tsx` | Uses resolver, flicker-free |
| `AccessDeniedPage.tsx` | Terminal (no auto-redirect) |
| `ConsolePage.tsx` | Fixed pageKey: admin.console |
| `UsersPage.tsx` | Resolver-driven tabs |
| `BillingPage.tsx` | Resolver-driven tabs |
| `permissionPreviewEngine.ts` | Exact match only |

---

## Files Removed/Deprecated

| File | Reason |
|------|--------|
| `startsWith` in checks | SAP violation |
| Auto-redirect in AccessDenied | Terminal only |

---

## How to Verify

### 1. Curators-Only User
```
Email: curators-only@test.com
Password: TestPassword123!
```
- Login → Go to /admin/users
- Should see ONLY Curators tab
- Users tab NOT in DOM
- URL: ?tab=curators

### 2. Console Monitoring-Only
- Login with monitoring permission
- Go to /admin/console
- Should see ONLY allowed tab
- Other tabs NOT rendered

### 3. Unauthorized Tab URL
- Type /admin/users?tab=users manually
- Should redirect to ?tab=curators (if allowed)
- Should NOT flash /access-denied

### 4. No-Permissions User
- Login with zero permissions
- Should show terminal AccessDenied
- Should NOT redirect anywhere

---

## Console Page Fix

**Problem:** `pageKey: 'admin.system-console'` did not match registry `'admin.console'`

**Fix:** Changed ConsolePage to use `'admin.console'`

---

**STATUS: IMPLEMENTED ✅**
