# SAP Parent Visibility CI Enforcement

## Summary

CI-level enforcement added to prevent first-child/order-dependent visibility logic.

---

## Files Added

### 1. Unit Tests
**File:** `client/src/tests/navigation/parent-visibility.spec.ts`

Tests:
- `should show parent if SECOND child is allowed (not first)`
- `should show parent if LAST child is allowed`
- `should show parent if MIDDLE child is allowed`
- `should hide parent if NO children allowed`
- `should show parent if parent.requiredAnyOf matches`

### 2. CI Scripts
**PowerShell:** `scripts/ci-parent-visibility-scan.ps1`
**Bash:** `scripts/ci-parent-visibility-scan.sh`

Forbidden patterns:
- `children[0]`
- `firstAllowed`
- `allowedTabs[0]`

---

## Package.json Scripts

```json
{
  "test:visibility": "vitest run src/tests/navigation/parent-visibility.spec.ts",
  "ci:visibility": "...",
  "ci:all": "npm run lint && npm run test:visibility"
}
```

---

## Verification

```
12 tests passed ✅

✓ hasAnyPermission (3)
✓ getAllowedTabs - Order-Independent Parent Visibility (5)
✓ getAllowedSubTabs - Order-Independent (2)
✓ Dictionaries - Order-Independent Parent Visibility (2)
```

---

## SAP Law Enforced

```
parent.visible = self.allowed OR ANY(child.visible)
```

- NO first-child checks
- NO order-dependent logic
- Recursive ANY evaluation
