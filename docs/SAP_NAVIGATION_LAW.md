# SAP-Grade Navigation Law (Engineering Constitution)

## Single Decision Center
**File:** `navigationResolver.ts`

Only this file may compute:
- Which tabs are allowed
- Which subTabs are allowed
- Where to redirect

## Single URL Canonicalizer
**File:** `ProtectedRoute.tsx`

Only this file may AUTOMATICALLY write URL.
All other files may only write URL on USER CLICK.

---

## Feature Page Compliance

| Rule | Implementation |
|------|----------------|
| NO useEffect URL sync | ❌ REMOVED from all pages |
| handleTabChange MERGES params | ✅ `new URLSearchParams(prev)` |
| Preserve unrelated params | ✅ Only modify tab/subTab |

---

## Fixed Files

### Automatic URL Sync REMOVED:
- SettingsPage.tsx
- ConsolePage.tsx
- DeveloperHubPage.tsx
- UsersPage.tsx
- BillingPage.tsx
- DictionariesTab.tsx
- MonitoringTab.tsx
- BillingConfigForm.tsx

### handleTabChange FIXED (merge params):
- SettingsPage.tsx
- ConsolePage.tsx
- DeveloperHubPage.tsx
- UsersPage.tsx
- BillingPage.tsx
- DictionariesTab.tsx

### useListQuery.ts:
- `reset()` preserves tab/subTab ✅

---

## Forbidden Patterns

```typescript
// ❌ FORBIDDEN: wipes other params
setSearchParams({ tab: value });

// ✅ CORRECT: merges params
setSearchParams(prev => {
    const newParams = new URLSearchParams(prev);
    newParams.set('tab', value);
    return newParams;
});
```

```typescript
// ❌ FORBIDDEN: in feature pages
useEffect(() => {
    setSearchParams(...);
}, [...]);
```

```typescript
// ❌ FORBIDDEN: wipes navigation
setSearchParams(new URLSearchParams());

// ✅ CORRECT: preserve navigation
setSearchParams(prev => {
    const newParams = new URLSearchParams();
    if (prev.get('tab')) newParams.set('tab', prev.get('tab'));
    if (prev.get('subTab')) newParams.set('subTab', prev.get('subTab'));
    return newParams;
});
```

---

## Acceptance Criteria

1. ✅ Deep-only permission shows parent + correct sub-submenu
2. ✅ URL never resets to first allowed
3. ✅ Query params preserved (page, sort, filters)
4. ✅ Scales to 5000+ sub-submenus
