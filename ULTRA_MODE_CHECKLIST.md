# ULTRA MODE — SAP-Grade ERP Implementation Checklist

## 1️⃣ CORE PRINCIPLES
- [x] RBAC DB-driven ONLY
- [x] Backend always authoritative
- [x] No implicit permissions
- [x] No owner bypass
- [x] Audit logging
- [x] Workflow-based approvals
- [x] Admin/Tenant isolation

---

## 2️⃣ PERMISSION & SCOPE STANDARD
- [x] `platform.<module>.<submodule>.<action>` format
- [x] `tenant.<module>.<submodule>.<action>` format
- [x] Scope enforcement (platform→SYSTEM, tenant→TENANT)
- [x] "view" removed, real actions only
- [x] Auto-add read when non-read selected (frontend)
- [x] Auto-add read when non-read selected (backend)

---

## 3️⃣ MENU & TAB ARCHITECTURE
- [x] Sidebar ONLY top-level menus
- [x] NO nested sidebar menus
- [x] Submodules as TABS/SUB-TABS via URL params
- [x] Menu visible if ANY tab permission exists
- [x] Parent redirects to first allowed tab

---

## 4️⃣ TAB/SUBTAB REGISTRY
- [x] RBAC_REGISTRY frozen
- [x] URL refresh preserves tab/subTab
- [x] Direct URL without permission → 403
- [x] Used by menu visibility
- [x] Used by route guard
- [x] Used by permission preview

---

## 5️⃣ ROLE MANAGEMENT + 4-EYES
- [x] Role lifecycle: DRAFT → PENDING → APPROVED/REJECTED
- [x] Changes never apply immediately
- [x] All changes go to Approvals
- [x] Only APPROVED affects role_permissions
- [x] Workflow defines approvers

---

## 6️⃣ APPROVALS MODULE
- [x] Top-level menu (no submenus)
- [x] ApprovalRequest entity (entityType, entityId, payload, status)
- [x] Approve/Reject/Diff/Timeline UI
- [x] Role approvals ONLY in Approvals page

---

## 7️⃣ NOTIFICATION SYSTEM
- [x] System-wide reusable
- [x] Eligible approvers receive notification
- [x] Deep link included
- [x] Click navigates to approval
- [x] Stored in DB

---

## 8️⃣ ACCESS DENIED UX
- [x] Zero permissions → login blocked
- [x] AZ message: "Hesabınız aktivdir..."
- [x] NO retry/redirect loop
- [x] ONLY Logout button
- [x] Auth stabilizes BEFORE routing

---

## 9️⃣ PERMISSION PREVIEW ENGINE
- [x] Simulates visible menus
- [x] Simulates accessible tabs
- [x] Simulates allowed/blocked routes
- [ ] Role editor integration
- [ ] Approval diff preview integration

---

## 🔟 RBAC SAFETY RULES
- [x] Cannot assign higher permissions
- [x] Cannot reduce higher roles
- [x] System roles locked
- [ ] SoD conflict detection UI

---

## 1️⃣1️⃣ EXPORT TO EXCEL
- [x] XLSX format ONLY (ExcelJS)
- [x] *.export permission prefix
- [x] Modal: Export all / Export filtered
- [x] Respects search/filter/sort
- [x] High-risk → approval required
- [x] Logged as SOC2 evidence

---

## 1️⃣2️⃣ LIST ENGINE
- [x] Fixed pageSize (10/15/25/50)
- [x] No user-controlled pageSize
- [x] Debounced search
- [x] Server-side pagination
- [x] Shared DTO + hook

---

## 1️⃣3️⃣ AUDIT & COMPLIANCE
- [x] Who/What/Before/After/Timestamp
- [x] Approval reference
- [ ] SOC2/ISO mapping auto-generated

---

## 1️⃣4️⃣ DELIVERABLES
- [x] Clean menu.definitions.ts
- [x] Stable auth flow
- [x] Deterministic RBAC
- [x] Working approvals + notifications
- [x] Zero access-denied loops
- [ ] E2E module demonstration

---

**Progress:** ~90%  
**Last Updated:** 2025-12-28T13:52
