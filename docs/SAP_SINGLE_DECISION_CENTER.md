# SAP-Grade Single Decision Center — Refactor Summary

## Nə Dəyişdi

### Phase 1: usePermissions.ts ✅
- Verb stripping regex SİLİNDİ (`/\.(read|create|...)$/`)
- İndi yalnız EXACT `includes()` istifadə olunur

### Phase 2: BillingConfigForm.tsx ✅
- `window.location.search` SİLİNDİ
- `getAllowedSubTabs()` resolver istifadə olunur
- Yalnız allowed subTabs render edilir

### Phase 3: workspace.routes.tsx ✅
- `can()` hook route body-dən SİLİNDİ
- `ProtectedRoute` sole gatekeeper

---

## Qadağan Edilmiş Patternlər

| Pattern | Niyə |
|---------|------|
| `permission.replace(/\.(read\|...)$/, '')` | Verb stripping |
| `window.location.search` access üçün | URL-derived access |
| `can()` route body-də | Parallel decision |
| `startsWith(basePermission)` | Prefix matching |

---

## Single Decision Center

**FILE:** `client/src/app/security/navigationResolver.ts`

Bütün naviqasiya qərarları bu fayldan keçir:
- `evaluateRoute()` — route qərarı
- `getAllowedTabs()` — icazəli tablar
- `getAllowedSubTabs()` — icazəli subTablar

---

## Yoxlama Addımları

```powershell
cd c:\Users\Dell\Desktop\antigravity_erp\client
npm run dev
```

- [x] TypeScript build keçir
- [x] usePermissions EXACT match
- [x] BillingConfigForm resolver-driven
- [x] workspace.routes cleaned
