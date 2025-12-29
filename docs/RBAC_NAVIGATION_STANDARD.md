# RBAC Navigation Standard

## SAP-Grade Authorization Rules

---

## Core Invariants

| Rule | Description |
|------|-------------|
| **Visible ⇒ Actionable** | If tab is visible, user CAN access it |
| **No Optimistic Render** | Never render unauthorized content |
| **No Flicker** | Never show /access-denied then redirect |
| **Exact Match Only** | NO startsWith, includes, wildcards |
| **Single Source** | TAB_SUBTAB_REGISTRY only |

---

## Permission Matching

### Allowed
```typescript
// Exact match
can('system.users.curators.read')
canAny(['perm.a', 'perm.b'])
canForTab(pageKey, tabKey, subTabKey)
```

### FORBIDDEN
```typescript
// These cause sibling leakage
startsWith('system.users')
includes('read')
parent.implies(child)
```

---

## Routing Behavior

### Tab Resolution

| Scenario | Behavior |
|----------|----------|
| No tab in URL | Redirect to first allowed tab |
| Unknown tab | Redirect to first allowed tab |
| Unauthorized tab | Redirect to first allowed tab |
| Unknown subTab | Redirect to first allowed subTab |
| Unauthorized subTab | Redirect to first allowed subTab |
| **NO allowed tabs** | Terminal /access-denied |

### Key: NO /access-denied Flicker
- /access-denied is ONLY for TERMINAL cases
- If user has ANY allowed tab → direct redirect
- NO intermediate /access-denied visit

---

## Tab Rendering

### Page Components MUST:
1. Get allowed tabs from registry
2. Render ONLY allowed tabs
3. Filter before render (not after)

```typescript
// Correct
const allowedTabs = getAllowedTabs(pageKey, permissions);
return allowedTabs.map(tab => <Tab key={tab.key} />);

// WRONG
const allTabs = getAllTabs();
return allTabs.filter(t => can(t.perm)).map(...);
```

---

## Sidebar Behavior

- Flat sidebar (no nested menus)
- Page visible if ANY tab is allowed
- Click → first allowed tab URL
- If zero tabs allowed → page hidden

---

## Files

| File | Purpose |
|------|---------|
| `tabSubTab.registry.ts` | Single Source of Truth |
| `usePermissions.ts` | Exact match helpers |
| `ProtectedRoute.tsx` | No-flicker guard |

---

**STATUS: ENFORCED ✅**
