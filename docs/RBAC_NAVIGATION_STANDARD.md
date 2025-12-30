# RBAC Navigation Standard

## Single Resolver Architecture

### Core Principle
**ONE RESOLVER** - `client/src/app/security/navigationResolver.ts`

This is the SINGLE source for ALL navigation authorization decisions.

---

## Exact Allowlist Rules

### ✅ ALLOWED
```typescript
// Exact string match
userPerms.includes('system.users.curators.read')
```

### ❌ FORBIDDEN
```typescript
// Prefix matching
perm.startsWith('system.users')

// Includes on permission parts
perm.includes('curators')

// Action-verb stripping
perm.replace(/\.read$/, '')

// Synthetic permissions
'system.users.access'
```

---

## Resolver API

```typescript
// Get allowed tabs (EXACT match)
getAllowedTabs(pageKey, userPerms, context): AllowedTab[]

// Get allowed subTabs (EXACT match)
getAllowedSubTabs(pageKey, tabKey, userPerms, context): AllowedSubTab[]

// Evaluate route decision
evaluateRoute(pathname, searchParams, userPerms, context): RouteDecision
// Returns: ALLOW | REDIRECT | DENY

// Get first allowed target for sidebar links
getFirstAllowedTarget(pageKey, userPerms, context): string | null
```

---

## Consumer Integration

### ProtectedRoute
```typescript
const decision = evaluateRoute(pathname, searchParams, perms, context);
// ALLOW → render children
// REDIRECT → Navigate directly (NO /access-denied)
// DENY → terminal AccessDenied
```

### useMenu/Sidebar
```typescript
// Show page only if has allowed tabs
const allowedTabs = getAllowedTabs(pageKey, perms, context);
if (allowedTabs.length === 0) return null;

// Link URL = first allowed target
const href = getFirstAllowedTarget(pageKey, perms, context);
```

### Page Components
```typescript
// Render ONLY allowed tabs
const allowedTabs = getAllowedTabs(pageKey, perms, context);
{allowedTabs.map(tab => <TabsTrigger key={tab.key} ... />)}
```

---

## SAP Rules

| Rule | Description |
|------|-------------|
| Visible = Actionable | If rendered, must be clickable |
| No DOM Leaks | Unauthorized items NOT in DOM |
| No Flicker | Never navigate to /access-denied for recoverable cases |
| Terminal Deny | Only when zero allowed targets |

---

**STATUS: IMPLEMENTED ✅**
