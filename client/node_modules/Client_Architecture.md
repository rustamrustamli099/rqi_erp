# Enterprise ERP Frontend

**Modular Monolith · Contract-Driven · SAP-level Architecture**

## Overview

This repository contains the frontend of an enterprise-grade ERP system. The frontend is designed as a **Modular Monolith** with **strict domain isolation**, **contract-driven backend communication**, and **ESLint-enforced architectural guardrails**.

The primary goal is long-term scalability, maintainability, and the ability to evolve the backend (monolith → microservices) **without breaking the frontend**.

---

## Key Principles

### 1. Modular Monolith

* Single frontend application
* Internally split into **isolated business domains**
* No shared business logic across domains

### 2. Domain-Driven Structure

Each business area lives in its own domain:

```
src/domains/<domain>/
  api/        # Backend contracts (single source of truth)
  state/      # Domain state & business logic
  views/      # Domain UI (pages + private UI helpers)
  events.ts   # Domain events
  routes.tsx  # Domain routes
  index.ts    # Public domain API
```

Domains **never import other domains’ internals**.

### 3. Contract-Driven API

* Frontend never calls `axios` / `fetch` directly
* All backend access goes through **domain contracts**:

```
domains/<domain>/api/<domain>.contract.ts
```

This makes the frontend **backend-agnostic** and **microservice-ready**.

### 4. Shared Kernel

```
src/shared/
  components/   # Reusable UI components
  hooks/        # Generic hooks
  lib/          # Infra utilities (api client, helpers)
```

The shared layer is **pure and domain-agnostic**.

### 5. Architecture Enforcement (FINAL FREEZE MODE)

* ESLint boundaries enforce architectural rules
* Invalid imports fail lint & CI
* Architecture is **frozen by design**, not by convention

---

## Testing & Infrastructure

The project includes **lightweight, production-oriented infrastructure skeletons**. These are intentionally minimal and are designed to **support business development without slowing it down**.

### ✅ Stage 1 — Test Infrastructure (Completed)

* **Vitest** + **Testing Library** configured
* Global test setup (`src/test/setup.ts`)
* Example skeleton test to verify infra
* No business logic tests enforced at this stage

Purpose:

> Enable safe business logic development with tests, without upfront overhead.

---

### ✅ Stage 2 — CI Pipeline Skeleton (Completed)

* GitHub Actions CI pipeline
* Runs on push & pull request
* Steps enforced:

  * ESLint (architecture guardrails)
  * Tests
  * Build

Purpose:

> Fail fast on architectural, test, or build issues.

---

### ✅ Stage 3 — Caching Skeleton (Completed)

* **TanStack Query** integrated
* Single global `QueryClient` (`shared/lib/queryClient.ts`)
* App root wrapped with `QueryClientProvider`
* Example skeleton hook (no real data)

Purpose:

> Prepare consistent caching patterns without introducing premature complexity.

---

### ⏭️ Stage 4 — Performance Guards (Next)

* Lazy loading boundaries
* Code-splitting patterns
* Memoization guidelines

Performance tuning is applied **only when business usage requires it**.

---

## What This Architecture Solves

* Prevents frontend chaos as the project grows
* Enables parallel frontend/backend development
* Supports backend refactors without frontend rewrites
* Makes onboarding new developers predictable

---

## What This Repository Is NOT

* Not a micro-frontend setup
* Not a framework playground
* Not loosely structured React code

This is a **production-first ERP frontend**.

---

## Do & Don’t Rules (Non‑Negotiable)

### ❌ What You MUST NOT Do

When writing **business logic**, the following are strictly forbidden:

* ❌ Do NOT put business logic inside `shared/`
* ❌ Do NOT put business logic inside `app/` or `shell/`
* ❌ Do NOT call `axios`, `fetch`, or backend URLs inside components or views
* ❌ Do NOT import another domain’s internals directly
* ❌ Do NOT import from `domains/*/views/*` or `domains/*/state/*`
* ❌ Do NOT bypass domain contracts
* ❌ Do NOT add new architectural layers
* ❌ Do NOT weaken ESLint rules or silence violations

Breaking any of these rules is considered an **architecture violation**.

---

### ✅ What You SHOULD Do

These are the correct and allowed patterns:

* ✅ Write business logic ONLY inside `domains/<domain>/state`
* ✅ Access backend ONLY via `domains/<domain>/api/*.contract.ts`
* ✅ Use domain events for cross-domain communication
* ✅ Keep `shared/` pure and reusable (no business rules)
* ✅ Keep UI logic inside `views/`
* ✅ Expose domain functionality ONLY via `domains/<domain>/index.ts`
* ✅ Let ESLint fail early instead of fixing issues later

---

### 🧠 Mental Model to Remember

> **Shared = tools**
>
> **Domains = business rules**
>
> **Contracts = backend boundary**
>
> **ESLint = architecture police**

---

* Not a micro-frontend setup
* Not a framework playground
* Not loosely structured React code

This is a **production-first ERP frontend**.

---

## One-Sentence Summary

> A contract-driven, modular monolith ERP frontend with strict domain isolation and SAP-level architectural discipline.

---

## Status

* Architecture: **Frozen & Stable**
* Domains: **Isolated**
* API Integration: **Contract-based**
* Ready for: **Business Logic Development**

---

## ✅ Stage 4 — Performance Guard Skeleton (Completed)

This stage finalizes frontend infrastructure by adding **lightweight performance guardrails** without touching business logic.

### What was done

* **Route-level lazy loading** using `React.lazy` and `Suspense`
* **Unified loading UI** via `PageLoader`
* **Tenant bootstrap** correctly moved to the `shell` layer
* **No premature optimization** applied

### Key architectural decision

* `TenantLoader` now lives under:

  ```
  src/shell/TenantLoader.tsx
  ```

  This aligns with enterprise-grade (SAP/Salesforce-style) architecture:

  * `app` → orchestration & routing
  * `shell` → runtime context (tenant, auth, layout)
  * `domains` → business logic

### Explicit non-goals (important)

* ❌ No profiling tools
* ❌ No performance libraries
* ❌ No business logic refactors
* ❌ No caching changes

### Status

> **Stage 4 complete. Performance guard skeleton is finalized.**

---

## 🟢 Architecture & Infrastructure Status

* ESLint architectural boundaries — **ENFORCED**
* Test infrastructure — **READY**
* CI pipeline — **ACTIVE**
* Caching skeleton — **READY**
* Performance guards — **READY**

### 🚀 Next Phase

Infrastructure is now **frozen and complete**.

👉 The project is ready for **Business Logic Development** inside `src/domains/*`.

No further structural changes are required.

---

## 🧩 `components` vs `_components` QAYDASI (VACİB)

Bu layihədə **UI iyerarxiyası və encapsulation** üçün `components` və `_components` anlayışları **şÜURLU şəkildə ayrılıb**.

### ✅ `components/` — PUBLIC UI

**NƏDİR:**

* Domain-in **kənara açıq** olan UI hissələri
* Başqa layer-lər (app / shell) tərəfindən istifadə OLUNA bilər

**İCAZƏLİ İSTİFADƏ:**

* `routes.tsx`
* `views/*.tsx`
* Shell layout-ları

**QAYDALAR:**

* Reusable olmalıdır
* Business logic daşımamalıdır
* API / state çağırışı ETMƏMƏLİDİR

**NÜMUNƏ:**

```
domains/finance/components/BillingSummary.tsx
```

---

### ⚠️ `_components/` — PRIVATE (DOMAIN INTERNAL)

**NƏDİR:**

* YALNIZ həmin domain üçün olan daxili UI hissələri
* Heç vaxt domain-dən kənara çıxmamalıdır

**İCAZƏLİ İSTİFADƏ:**

* EYNİ domain daxilində
* `views/*` və `components/*` tərəfindən

**QADAĞANDIR:**

* `app/`, `shell/`, `shared/` içindən import
* Başqa domain-dən import

**NÜMUNƏ:**

```
domains/finance/_components/InvoiceTable.tsx
```

---

### 🚫 QƏTİ QADAĞALAR

❌ `_components` → export edilməz
❌ `_components` → `index.ts`-ə salınmaz
❌ `_components` → cross-domain import OLMAZ
❌ `_components` → shared-ə daşınmaz

---

### 🧠 NİYƏ BU MODEL?

* Domain encapsulation qorunur
* SAP-style ERP-lərdə istifadə olunan modeldir
* Microservice-ə bölünəndə UI sızması olmur
* ESLint `boundaries` qaydaları ilə **enforce olunur**

---

### ✅ QISA XÜLASƏ

| Folder         | Kim istifadə edə bilər | Məqsəd      |
| -------------- | ---------------------- | ----------- |
| `components/`  | Domain + App + Shell   | Public UI   |
| `_components/` | Yalnız Domain          | Internal UI |

---

📌 **Bu qayda da FINAL FREEZE MODE-a daxildir və dəyişdirilməməlidir.**
