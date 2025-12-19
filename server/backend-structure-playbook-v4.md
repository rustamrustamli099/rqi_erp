# Antigravity ERP — Backend Structure Playbook (FINAL v4 — Scripts & CI Governed)

> **Status:** ARCHITECTURE & SECURITY LOCKED ✅  
> **Phase:** Operational Governance & CI Enforcement  
> **Model:** Modular Monolith, Microservice-Ready (SAP / Bank ERP)

Bu sənəd Antigravity ERP backend arxitekturasının **SON (v4)** vəziyyətidir.
Burada struktur, scripts governance və CI/CD təhlükəsizlik qaydaları rəsmi şəkildə təsdiqlənir.

---

## 0) Final Status

✔ Backend strukturu SAP-grade və kilidlənib  
✔ Permission & multi-role modeli tətbiq olunub  
✔ Scripts ayrıca governance altındadır  
✔ CI/CD təhlükəsizlik qaydaları mövcuddur  

➡️ Bu nöqtədən sonra yalnız **business logic və UI development** aparılır.

---

## 1) Folder Structure — FINAL (Scripts Included)

```
server/
 ├── src/
 │   ├── platform/
 │   ├── shared-kernel/
 │   ├── modules/
 │   ├── integrations/
 │   └── common/
 │
 ├── scripts/
 │   ├── migrate-roles.ts
 │   ├── seed-roles.ts
 │   └── README.md
 │
 ├── prisma/
 ├── test/
 ├── docker-compose.yml
 └── Dockerfile
```

---

## 2) Scripts Folder — ENTERPRISE GOVERNANCE

### Purpose
`scripts/` is used ONLY for:
- One-time migrations
- Seed / backfill operations
- Emergency administrative fixes

Scripts are NOT part of runtime.

---

### What is Allowed
✔ Direct Prisma access  
✔ Explicit execution  
✔ Dry-run support  
✔ Production confirmation guard  
✔ Audit logging  

---

### What is Forbidden
❌ Business logic  
❌ Domain rules  
❌ Runtime invocation  
❌ Auto-run (cron, startup)  
❌ Silent failures  

---

### Mandatory Script Rules
- Must be idempotent where possible
- Must write audit record on every execution
- Must explicitly exit process
- Must refuse production execution without confirmation flag

---

## 3) Script Audit Strategy

Each script execution MUST be recorded in a dedicated audit table.

Audit record includes:
- Script name
- Environment
- Executor
- Status
- Affected records
- Timestamp

Audit data is immutable.

---

## 4) CI/CD Governance (NEW)

CI enforces script safety rules.

CI MUST:
- Detect changes under `scripts/`
- Fail if scripts:
  - auto-execute
  - lack production guard
  - lack dry-run support
  - bypass audit logging
- Prevent scripts from being imported into application runtime

Scripts are NEVER executed in CI/CD pipelines.

---

## 5) Non-Negotiable Rules

DO:
✔ Treat scripts as surgical tools  
✔ Require human approval in production  
✔ Audit everything  

DON’T:
❌ Mix scripts with application logic  
❌ Skip CI checks  
❌ Bypass governance  

---

## 6) Final Declaration

> Antigravity ERP backend architecture,
> scripts governance, and CI enforcement
> are COMPLETE and LOCKED.
