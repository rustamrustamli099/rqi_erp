# RBAC Navigation Invariants

**Version:** 1.0  
**Status:** FROZEN

---

## CORE INVARIANTS

### 1. Visible ⇒ Actionable
- If a menu item renders, clicking it MUST work
- No optimistic rendering
- No "click does nothing" scenarios

### 2. Exact Permission Checks Only
- NO prefix matching (startsWith)
- NO pattern matching (*)  
- Direct permission slug comparison only

### 3. No Dashboard Fallback
- Unauthorized route → terminal /access-denied
- NO silent redirect to dashboard
- User must explicitly know access is denied

### 4. Tab/SubTab Authorization
- tab query param is part of authorization
- Unknown tab in URL → redirect to first allowed tab
- No allowed tab for page → terminal /access-denied
- subTab follows same rules

### 5. Single Source of Truth
- TAB_SUBTAB_REGISTRY is canonical
- menu.definitions.ts generated from registry
- ProtectedRoute consults registry
- Sidebar consults registry

---

## AUTHORIZATION FLOW

```
1. User navigates to /admin/settings?tab=dictionaries&subTab=currency

2. ProtectedRoute:
   a. Find page in registry (admin.settings)
   b. Check if user has ANY allowed tab
   c. If tab param exists:
      - Validate tab is in registry
      - Validate user has permission for tab
      - If subTab param exists, validate subTab too
   d. If unauthorized:
      - Try redirect to first allowed tab
      - If no allowed tab → /access-denied

3. Page renders only when authorization passes
```

---

## FORBIDDEN PATTERNS

❌ Prefix-based menu visibility
❌ Synthesized .access permissions  
❌ Silent dashboard fallback
❌ Optimistic tab rendering
❌ Multiple sources of permission truth

---

## REQUIRED PATTERNS

✅ Exact permission match
✅ Terminal /access-denied for unauthorized
✅ First allowed tab redirect
✅ Registry-driven menu generation
✅ Canonical route generation

---

**Violations of these invariants are blocking bugs.**
