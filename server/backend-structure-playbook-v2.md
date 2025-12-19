# Antigravity ERP — Backend Structure Playbook (FINAL, SAP‑GRADE)

> **Status:** ARCHITECTURE LOCKED ✅  
> **Model:** Modular Monolith, Microservice‑Ready  

Bu sənəd Antigravity ERP backend‑inin son vəziyyətini və edilən bütün
refaktorinq + polish addımlarını sənədləşdirir.

---

## 0) Hazırkı vəziyyət

✔ Modular Monolith  
✔ DDD (api / application / domain / infrastructure)  
✔ Platform vs Business ayrımı  
✔ Shared‑Kernel purity  
✔ Event‑driven communication  
✔ Security‑first authorization  
✔ dependency‑cruiser enforced  

---

## 1) Folder strukturu (FINAL)

```
src/
 ├── platform/
 ├── shared-kernel/
 ├── modules/
 │   └── <domain>/
 │       ├── api/
 │       ├── application/
 │       ├── domain/
 │       ├── infrastructure/
 │       └── contract/ (optional)
 ├── integrations/
 └── common/
```

---

## 2) Son dəyişikliklər

- Service → UseCase rename
- Event listeners → infrastructure
- Legacy code cleanup
- Contract policy applied
- Security stack finalized

---

## 3) Qaydalar

- Domain → infrastructure dependency QADAĞANDIR
- Cross‑module call yalnız contract/event
- Shared‑kernel business logic saxlamır
- UI security boundary deyil

---

## 4) Security modeli

- Permission = capability
- Redis = cache
- Refresh token = HttpOnly cookie
- Guard = final authority

---

## 5) Status

Bu nöqtədən sonra domain logic yazmaq təhlükəsizdir.
