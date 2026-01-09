# GEMINI.md — SAP ERP / PFCG AUTHORIZATION LAW BOOK

This document is **binding**.
Any change that violates these rules is considered a **critical architectural regression**.

---

## 1. CORE PHILOSOPHY

### 1.1 Single Decision Center (SDC)

There MUST be exactly **ONE** place where authorization and visibility decisions are made.

✅ **Allowed**

* Backend `DecisionCenterService`
* Backend `DecisionOrchestrator`

❌ **Forbidden**

* Frontend permission checks
* Backend services deciding visibility independently
* Duplicate menu / routing engines

If more than one decision source exists → **SYSTEM IS INVALID**.

---

## 2. FRONTEND = DUMB RENDERER

The frontend is a **stateless renderer**.
It MUST NOT:

* Check permissions
* Infer access
* Filter menu, tabs, or sections
* Decide default routes
* Contain business authorization logic

Frontend renders **ONLY** what backend explicitly allows.

Default UI state = **HIDDEN**.

---

## 3. ABSOLUTELY NO BYPASSES

### 3.1 Owner / SuperAdmin Bypass

❌ **FORBIDDEN**

* `isOwner`
* `SuperAdmin`
* `permissions.length`
* Hardcoded allow-all paths

No role bypasses authorization.
Not in backend. Not in frontend.

Any bypass = **GLOBAL FAIL**.

---

## 4. AUTHORIZATION MODEL

### 4.1 Exact-Match Only

Permissions MUST be matched **exactly**.

❌ Forbidden patterns:

* `startsWith`
* Wildcards
* Prefix inference
* Heuristic grouping

Authorization ≠ analytics.

---

## 5. PAGE AUTHORIZATION (Z_*)

Every routable page MUST:

* Have a `Z_*` object
* Be enforced via `PageGate` or `usePageState.authorized`

If a page renders without checking `authorized` → **INVALID**.

---

## 6. PAGE CONTENT AUTHORIZATION (CRITICAL)

Authorization does NOT stop at page level.

The following MUST be backend-driven:

* Create / Edit / Delete buttons
* Approve / Reject actions
* Export / Download
* Toolbars
* Tabs / Subtabs
* Sections / Panels

### Rule

UI elements are **hidden by default** and appear ONLY if:

```
pageState.actions[KEY] === true
pageState.sections[KEY] === true
```

Any default-visible action = **SECURITY VIOLATION**.

---

## 7. READ-ONLY USER GUARANTEE

A READ-only user MUST:

* See pages only if explicitly allowed
* NEVER see Create / Update / Delete / Approve / Export UI

If READ-only users see action UI → **SYSTEM IS BROKEN**.

---

## 8. MENU & ROUTING

### 8.1 Menu

Menu structure MUST be returned by backend:

* `/api/v1/me/menu`

Frontend MUST NOT:

* Build menu
* Filter menu
* Decide visibility

### 8.2 Default Route

Default route MUST be provided by backend.
Frontend MUST NOT compute first-allowed routes.

---

## 9. TAB / SUBTAB RULES

Tabs and subtabs are **authorization objects**, not UI preferences.

❌ Forbidden:

* `allowedKeys`
* `requiredAnyOf`
* Local tab filtering

Backend MUST decide visible tabs.
Frontend renders exactly what it receives.

---

## 10. DUPLICATE / LEGACY ENGINES

❌ Forbidden:

* Duplicate menu controllers
* Legacy usecases that filter permissions
* Commented-out modules that can be re-enabled

If legacy logic exists, it MUST be:

* Deleted OR
* Physically unreachable

---

## 11. AUDIT RULE

Any change MUST pass a **Codex audit** using:

* Runtime behavior
* Latest commit
* Evidence with file + line numbers

Claims, comments, or intent do NOT count.

---

## 12. FAILURE POLICY

If ANY rule is violated:

* Phase is BLOCKED
* System is NOT SAP PFCG compliant
* Release is NOT allowed

Partial compliance = **FAIL**.

---

## 13. FINAL PRINCIPLE

> Backend decides.
> Frontend obeys.
> Nothing else exists.

---

**This document is the source of truth.**
