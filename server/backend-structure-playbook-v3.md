# Antigravity ERP — Backend Structure Playbook (FINAL v3 — UI Integrated, SAP-GRADE)

> **Status:** ARCHITECTURE & SECURITY LOCKED ✅  
> **Phase:** Backend ↔ Frontend Permission-Driven Integration  
> **Model:** Modular Monolith, Microservice-Ready (SAP / Bank ERP)

Bu sənəd Antigravity ERP sisteminin **SON və TAM** arxitektura vəziyyətini,
backend–frontend inteqrasiyasını və **nələr OLAR / nələr OLMAZ** qaydalarını
rəsmi şəkildə təsdiqləyir.

---

## 0) Ümumi Status (Final)

✔ Backend strukturu SAP-grade və kilidlənib  
✔ Platform / Shared-Kernel / Modules ayrımı tamdır  
✔ Permission & Role sistemi backend-first-dir  
✔ UI permission-driven, security backend-dədir  
✔ Multi-tenant & impersonation-aware model mövcuddur  

➡️ Bu nöqtədən sonra **struktur müzakirəsi BAĞLANIB**.

---

## 1) Folder Structure — FINAL (Updated)

```
src/
 ├── platform/
 │   ├── auth/
 │   ├── audit/
 │   ├── console/
 │   ├── feature_flags/
 │   ├── http/
 │   ├── identity/
 │   ├── observability/
 │   └── tenant-context/
 │
 ├── shared-kernel/
 │   ├── base-entities/
 │   ├── value-objects/
 │   ├── domain-events/
 │   └── event-bus/
 │
 ├── modules/
 │   ├── billing/
 │   ├── addresses/
 │   ├── branches/
 │   ├── dashboard/
 │   ├── files/
 │   ├── menus/
 │   ├── packages/
 │   └── payment/
 │
 ├── integrations/
 ├── common/
 └── app.module.ts
```

---

## 2) Backend ↔ Frontend Integration Rules

- Backend is the ONLY authority for permissions
- Frontend consumes permission snapshot
- UI hiding is UX only, not security

---

## 3) Menu & Action Mapping

Menu items:
- Declared with required permissions
- Hidden if permission missing
- Submenus inherit parent visibility

---

## 4) 403 UX Pattern

- Dedicated Not Authorized page
- No sensitive data leakage
- Clear feedback to user

---

## 5) Multi-Tenant & Impersonation

- Active tenant always visible
- Impersonation banner mandatory
- All impersonated actions audited

---

## 6) Final Rules

DO:
- Permission-driven UI
- Backend guards everywhere

DON’T:
- UI-based security
- Structural refactors

---

## 7) Final Declaration

Architecture is COMPLETE and LOCKED.
