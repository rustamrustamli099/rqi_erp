# SAP-Grade Nav Bootstrap Fix

## Dəyişikliklər

### MonitoringTab.tsx ✅
- `resolverReady` gate əlavə edildi
- URL mutation YALNIZ `resolverReady && allowedKeys.length > 0` olduqda
- `currentSubTab` loading zamanı URL dəyərini saxlayır

### BillingConfigForm.tsx ✅
- Eyni `resolverReady` pattern tətbiq edildi
- Tab param saxlanılır, yalnız subTab yazılır

### useMenu.ts ✓
- Artıq permissions deps-ə daxildir (line 77)
- STABLE gate + permissions = düzgün

---

## resolverReady Contract

```typescript
const resolverReady = !isLoading && permissions.length > 0;
```

**Harada istifadə:**
- Hər TAB komponentində URL mutation effect-dən əvvəl

---

## Qadağan Edilmiş Patternlər

| Pattern | Niyə |
|---------|------|
| URL yazma `isLoading` zamanı | Empty allowedKeys yazılır |
| `allowedKeys[0]` loading zamanı | Boş array-dan default |
| Memo authState-ə görə (permissions-suz) | Stale menu |

---

## Yoxlama

- [x] TypeScript build keçir
- [x] MonitoringTab resolverReady gate
- [x] BillingConfigForm resolverReady gate
