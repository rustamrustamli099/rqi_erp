# RQI ERP Reference Architecture Whitepaper
## SAP-Grade PFCG Authorization
### Modular Monolith, Microservice-Ready by Design

**System:** RQI ERP  
**Date:** 2026-01-01  
**Status:** Canonical · Audit-Safe · Phase 10 Closed · Phase 11 Verified · Phase 12 Locked  

---

## Abstract

This whitepaper describes the RQI ERP reference architecture: a SAP-grade authorization and navigation system designed as a **modular monolith** with **microservice-ready boundaries**. The architecture enforces a **Single Decision Center**, strict scope-aware RBAC (PFCG-style), deterministic routing/canonicalization, correctness-first caching with explicit invalidation, and read-only observability and audit logging.

The result is an ERP-grade platform that is easy to audit, resilient to drift, and mechanically extractable into microservices without redesign.

---

## 1. Problem Statement

ERP platforms commonly fail their security and operational goals because authorization decisions become fragmented across:
- UI components (conditional rendering, feature gating, permission checks)
- multiple backend “helpers” or parallel engines
- implicit permission inference (e.g., write implies read)
- ad-hoc caching without explicit invalidation

These patterns create inconsistent behavior, audit complexity, and high regression risk.

RQI ERP prevents this by enforcing **one decision authority** and strict architectural boundaries.

---

## 2. Core Principles

### 2.1 Single Decision Center (Non-Negotiable)
All of the following are decided in **one place**:
- navigation visibility
- menu hierarchy and container visibility rules
- tab/subTab access
- action visibility
- default routing and canonical URL output
- invalid URL correction

**UI never decides.**

### 2.2 Dumb UI
The UI:
- does not check permissions (`can()`, `hasPermission()`, etc. are forbidden)
- does not infer context
- does not select defaults
- renders only the already-resolved output

### 2.3 Exact Match Permissions
Permissions are flat string slugs with **exact match only**.
No inference, no implicit grants, no hierarchical semantics.

### 2.4 Correctness First
Performance is layered **outside** the Decision Center:
- caching is wrapper-only
- invalidation is explicit and synchronous
- TTL is not relied upon for correctness

### 2.5 Auditability as a First-Class Constraint
If a change makes the system harder to audit, the change is wrong.

---

## 3. Architectural Style

### 3.1 Modular Monolith
RQI ERP ships as a single deployable unit but is internally structured as strict modules with clear ownership:
- IAM/PFCG domain
- Session context
- Decision Center
- Orchestration layer
- Caching layer
- Observability/Audit

Modules communicate via explicit interfaces/contracts.

### 3.2 Microservice-Ready
“Microservice-ready” means modules can be extracted without redesign because:
- domain logic is pure and stateless where appropriate
- orchestration is separated from domain rules
- infrastructure concerns are abstracted
- cross-module coupling is minimized and explicit

The system is **intentionally not distributed** today, while remaining extractable tomorrow.

---

## 4. Canonical Responsibilities

### 4.1 IAM / PFCG Domain
- Roles and composite roles (with cycle protection)
- User-role assignments scoped explicitly (SYSTEM vs TENANT)
- Effective permissions computed via `EffectivePermissionsService`
- No direct permissions on users

### 4.2 Session Context
- Explicit context switching via backend endpoints
- Stateless JWT carries identity + scope only
- No permissions inside tokens

### 4.3 Decision Center
**Backend:** `DecisionCenterService` (pure, cache-unaware)  
**Frontend:** `navigationResolver.ts` (consumes resolved output)

Enforces:
- container visibility rules
- action visibility from permissions
- route canonicalization output

### 4.4 Orchestration
`DecisionOrchestrator` composes:
- session context → effective permissions → decision resolution

Contains glue only; no domain rules.

### 4.5 Caching (Phase 10)
- Phase 10.2: cache effective permissions output (`string[]`)
- Phase 10.3: cache final decision result `{navigation, actions, canonicalPath}` keyed by user+scope+route hash
- Phase 10.4: explicit invalidation hooks on authorization-affecting events

Forbidden:
- caching inside Decision Center
- controller-level caching
- UI-side caching or decision logic
- TTL-only correctness

### 4.6 Observability & Audit (Phase 11)
- structured logging with sensitive data redaction
- audit events for IAM and session operations
- Prometheus metrics endpoint and counters/histograms
- observability is read-only and vendor-neutral via interfaces

### 4.7 Performance SLOs (Phase 12)
- measurement-only baselines and SLO targets
- no code changes or optimizations
- explicit “DO NOT OPTIMIZE” guardrails

---

## 5. Stable Contracts

- Permission slug: `string` (exact match)
- Effective permissions: `string[]`
- Decision result:
  - `navigation` (resolved tree)
  - `actions` (resolved list)
  - `canonicalPath` (canonical route)
- Audit event: append-only, request-correlated, scope-aware

These contracts are stable and remain valid if modules are extracted into microservices.

---

## 6. Governance and Drift Prevention

Enforced by:
- GEMINI constitution (project laws)
- CI/lint rules banning UI permission checks
- regression tests for SAP laws
- phase audit gates (Task → Audit → Lock)

---

## 7. Recommended Next Step After Phase 12

Phase 12 produced targets and assumptions, but **explicitly states no load testing has been performed**. Therefore the correct next step is:

**PHASE 13A — Load & Stress Testing (Non-invasive)**  
Validate SLOs and baselines under representative load without changing code paths. After real measurements exist, proceed to controlled optimization planning.

---

## Conclusion

RQI ERP demonstrates that SAP-grade authorization, auditability, and performance can coexist when decision logic is centralized, UI is passive, caching is layered, invalidation is explicit, and observability is read-only. The modular monolith approach provides immediate operational simplicity while preserving the ability to extract microservices later without redesign.

---

**Canonical Status:** Reference Architecture · Audit-Safe · Drift-Resistant
