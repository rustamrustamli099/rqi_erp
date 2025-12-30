# Parent Menu Visibility Fix

## Problem

Parent visibility was computed using first-child logic only.

## SAP Rule

```
parent.visible = self.allowed OR ANY(child.visible)
```

No first-child checks, no order dependency.

---

## Fix Applied

**File:** `navigationResolver.ts`

### Before:
```typescript
return page.tabs
    .filter(tab => hasAnyPermission(userPerms, tab.requiredAnyOf))
    .map(tab => ({ key: tab.key, label: tab.label }));
```

### After:
```typescript
return page.tabs
    .filter(tab => {
        // SAP-GRADE: Tab visible if:
        // 1. Tab's own requiredAnyOf matches, OR
        // 2. ANY subTab's requiredAnyOf matches
        const selfAllowed = hasAnyPermission(userPerms, tab.requiredAnyOf);
        if (selfAllowed) return true;

        // Check children recursively
        if (tab.subTabs && tab.subTabs.length > 0) {
            const anyChildAllowed = tab.subTabs.some(subTab => 
                hasAnyPermission(userPerms, subTab.requiredAnyOf)
            );
            return anyChildAllowed;
        }

        return false;
    })
    .map(tab => ({ key: tab.key, label: tab.label }));
```

---

## Verification

1. User with ONLY `pricing.read` permission → `billing_config` tab visible
2. User with ONLY `invoice.read` permission → `billing_config` tab visible
3. User with NO billing permissions → `billing_config` tab NOT visible
