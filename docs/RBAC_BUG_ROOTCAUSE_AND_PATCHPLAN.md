# RBAC Bug Root Cause & Patch Plan

## Bugs Fixed (December 2024)

---

### Bug A: Console Monitoring Sub-SubTabs Snap-Back

**File:** `client/src/domains/system-console/monitoring/views/MonitoringTab.tsx`

**Root Cause:**
MonitoringTab rendered ALL 4 sub-tabs unconditionally without permission checks. When user clicked unauthorized subTab, URL updated briefly then snapped back because ProtectedRoute clamped it.

**Fix:**
- Import `getAllowedSubTabs` from resolver
- Compute `allowedSubTabs` from exact permission match
- Clamp URL subTab to first allowed if unauthorized
- Render ONLY allowed `TabsTrigger` and `TabsContent` components
- Empty allowedSubTabs = terminal inline 403

**SAP Rule Applied:** Unauthorized triggers never mount in DOM.

---

### Bug B: Settings Parent Tabs Hidden for Granular Permissions

**File:** `client/src/app/navigation/tabSubTab.registry.ts`

**Root Cause:**
`dictionaries` and `billing_config` tabs only had parent slugs in `requiredAnyOf`:
- `system.settings.system_configurations.dictionary.read`
- `system.settings.system_configurations.billing_configurations.read`

Users with granular permissions (e.g., `currency.read`) failed parent check → tab hidden.

**Fix:**
Expanded `requiredAnyOf` to include ALL child slugs:
```typescript
dictionaries.requiredAnyOf = [
    'system.settings.system_configurations.dictionary.read',
    'system.settings.system_configurations.dictionary.sectors.read',
    'system.settings.system_configurations.dictionary.units.read',
    'system.settings.system_configurations.dictionary.currency.read',
    'system.settings.system_configurations.dictionary.timezones.read',
    'system.settings.system_configurations.dictionary.address.read'
]
```

**SAP Rule Applied:** EXACT allowlist only. No startsWith, no prefix matching.

---

### Bug C: E2E Tests Updated for DOM Assertions

**Files:**
- `client/e2e/rbac-console-monitoring-only.spec.ts`
- `client/e2e/rbac-settings-dictionaries-only.spec.ts`

**Changes:**
- Assert unauthorized subTabs NOT in DOM (`toHaveCount(0)`)
- Verify no `/access-denied` flash during redirects
- Test granular permission grants parent tab access

---

## Files Modified

| File | Change |
|------|--------|
| `MonitoringTab.tsx` | Resolver-driven allowlist |
| `tabSubTab.registry.ts` | Expanded requiredAnyOf for dictionaries/billing_config |
| `rbac-console-monitoring-only.spec.ts` | DOM assertions |
| `rbac-settings-dictionaries-only.spec.ts` | DOM assertions |

---

## Verification Checklist

1. **Start servers**
2. **Login as `monitoring-only@test.com`**
   - Navigate to `/admin/console?tab=monitoring&subTab=alerts`
   - Expected: URL clamps to `subTab=dashboard`, only Dashboard trigger visible
3. **Login as `dictionaries-currency@test.com`**
   - Navigate to `/admin/settings`
   - Expected: Dictionaries tab visible, Currency subTab only
4. **Run E2E:** `npx playwright test e2e/rbac-*`
