# GEMINI CONSTITUTION
# SAP ERP / PFCG Authorization Law Book

This document is NON-NEGOTIABLE.
Any violation is considered a SECURITY BUG.

---

## 0. CORE PHILOSOPHY

This system follows SAP ERP / PFCG principles.

There is:
- ONE Decision Center
- ZERO frontend authorization logic
- ZERO implicit permission inference
- ZERO owner/superadmin bypass

Frontend is a DUMB RENDERER.
Backend is the ONLY authority.

---

## 1. SINGLE DECISION CENTER (MANDATORY)

### 1.1 Allowed Decision Location
ONLY the backend may decide:
- page access
- menu visibility
- tab visibility
- action availability
- default routes

Canonical components:
- DecisionCenterService
- DecisionOrchestrator
- PAGE_OBJECTS_REGISTRY (Z_*)
- ACTION_REGISTRY (GS_*)

### 1.2 Forbidden Decision Locations ❌
The following are STRICTLY FORBIDDEN:
- permissions.includes(...)
- can(), canAny(), canAll()
- startsWith / wildcard permission checks
- local menu filtering
- frontend tab visibility logic
- frontend default route calculation

Violation = audit FAIL.

---

## 2. FRONTEND RULES (DUMB UI)

Frontend MUST:
- Render ONLY what backend allows
- Hide EVERYTHING by default
- Obey pageState.authorized
- Obey pageState.actions
- Obey pageState.sections

Frontend MUST NEVER:
- Decide visibility
- Guess permissions
- Infer access
- Contain business authorization logic

---

## 3. PAGE AUTHORIZATION (Z_* OBJECTS)

### 3.1 Mandatory
EVERY routable page and sub-page MUST:
- Have a Z_* authorization object
- Be enforced via PageGate or usePageState.authorized

No Z_* → Page MUST NOT render.

### 3.2 Granularity
- Pages → Z_*
- Sub-pages → separate Z_*
- Detail pages → separate Z_*

---

## 4. CONTENT AUTHORIZATION (CRITICAL)

### 4.1 Default State
ALL UI elements are HIDDEN by default.

### 4.2 Allowed Visibility
A UI element may render ONLY if:

```typescript
pageState.actions[GS_*] === true
```

Applies to:
- buttons
- dropdown actions
- tabs
- sub-tabs
- toolbar actions
- bulk actions
- destructive actions

If backend did not allow → UI MUST NOT render.

---

## 5. PERMISSION MODEL

### 5.1 Exact Match Only
Permissions are matched by EXACT STRING equality.

Forbidden:
- prefix matching
- wildcard matching
- inferred parent permissions
- inferred read permissions

### 5.2 No Inference
Examples of forbidden inference:
- create → read
- child → parent
- *.access synthesis

---

## 6. OWNER / SUPERADMIN POLICY (ZERO TOLERANCE)

There is NO special user.

Owner / SuperAdmin:
- Has NO bypass
- Has NO implicit access
- Is treated as a normal user with permissions

Forbidden:
- isOwner flags
- permissions.length shortcuts
- role === 'Owner' bypass
- maintenance or emergency bypass

Violation = critical security failure.

---

## 7. MENU & NAVIGATION

Menu MUST:
- Be resolved by backend
- Be delivered fully resolved to frontend
- Contain visibility decisions already applied

Frontend MUST:
- Render menu AS-IS
- Never filter or compute visibility

---

## 8. DEPRECATION & CLEANUP

Deprecated logic MUST:
- Be removed, not ignored
- Never be imported at runtime
- Never be referenced by UI

Dead code is a SECURITY RISK.

---

## 9. CI / AUDIT RULES

Any PR MUST FAIL if:
- permissions.includes appears in UI
- frontend visibility logic exists
- page renders without Z_* gate
- UI action renders without GS_* gate

---

## 10. FINAL LAW

If backend did not EXPLICITLY allow,
frontend MUST NOT render.

NO EXCEPTIONS.
