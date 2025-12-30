# SAP-Grade Single URL Canonicalizer

## Arxitektura

**ProtectedRoute** = TƏK URL kanonikləşdiricisi

```
ProtectedRoute
    ├─▶ evaluateRoute() çağırır
    ├─▶ REDIRECT → Navigate (URL dəyişdirir)
    └─▶ ALLOW → child render (URL toxunulmur)
```

**Komponentlər** = Yalnız OXUYUR

```
MonitoringTab / BillingConfigForm
    ├─▶ searchParams.get('subTab') - OXUYUR
    ├─▶ allowedKeys ilə uyğunlaşdırır
    └─▶ handleTabChange - USER CLICK zamanı yazır
```

---

## Dəyişikliklər

### MonitoringTab.tsx ✅
- `useEffect` URL sync SİLİNDİ
- Yalnız user click (`handleTabChange`) URL yazır

### BillingConfigForm.tsx ✅
- `useEffect` URL sync SİLİNDİ
- `resolverReady` logic SİLİNDİ
- Yalnız user click URL yazır

---

## Qadağan Edilmiş Patternlər

| Pattern | Niyə |
|---------|------|
| Component-dən `useEffect` ilə URL yazma | Parallel canonicalizer |
| `setSearchParams` automatic (non-user) | ProtectedRoute işi |
| Loading zamanı URL yazma | Flash/reset |

---

## Yoxlama

- [x] TypeScript build keçir
- [x] MonitoringTab URL sync effect silindi
- [x] BillingConfigForm URL sync effect silindi
- [x] ProtectedRoute sole canonicalizer
