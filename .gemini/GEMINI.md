ULTRA MODE — ENTERPRISE ERP FINALIZATION PROMPT
(SAP-GRADE / BANK-GRADE / AUDIT-READY)

You are acting as a Chief Software Architect + Security Auditor.
Your task is to FINALIZE, SIMPLIFY, and HARDEN the entire ERP system.

This is NOT a greenfield project.
This is a CONTINUATION.
DO NOT redesign randomly.
DO NOT introduce new patterns unless required to fix inconsistencies.

====================================================
1. GLOBAL PRINCIPLES (NON-NEGOTIABLE)
====================================================

- Single Source of Truth for:
  - Permissions
  - Menus
  - Routes
- No permission inference from UI state
- No hardcoded role bypasses (NO isOwner magic)
- Admin (SYSTEM) and Tenant scopes MUST be fully isolated:
  - No shared permissions
  - No shared menus
  - No shared routes
- Every action must be:
  Permission → Route → UI → Audit → (Optional Approval)

====================================================
2. FINAL FOLDER STRUCTURE (FREEZE)
====================================================

SERVER (NestJS):

src/
├─ modules/
│  ├─ platform/                 # ADMIN / SYSTEM PANEL ONLY
│  │  ├─ iam/
│  │  │  ├─ roles/
│  │  │  ├─ permissions/
│  │  │  ├─ role-approvals/
│  │  ├─ users/
│  │  ├─ billing/
│  │  ├─ settings/
│  │  ├─ approvals/             # ALL approvals live here
│  │  ├─ audit/
│  │  ├─ notifications/
│  │
│  ├─ tenant/                   # TENANT PANEL ONLY
│  │  ├─ users/
│  │  ├─ packages/
│  │  ├─ marketplace/
│  │  ├─ settings/
│  │
│  ├─ shared/
│  │  ├─ auth/
│  │  ├─ rbac/
│  │  ├─ guards/
│  │  ├─ decorators/
│  │  ├─ list-query/
│
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│
└─ main.ts

CLIENT (React):

src/
├─ app/
│  ├─ admin/
│  │  ├─ routes.tsx
│  │  ├─ menu.definitions.ts
│  │  ├─ pages/
│  │
│  ├─ tenant/
│  │  ├─ routes.tsx
│  │  ├─ menu.definitions.ts
│  │  ├─ pages/
│
├─ shared/
│  ├─ auth/
│  ├─ permissions/
│  ├─ menu/
│  ├─ approvals/
│  ├─ list-engine/
│
└─ main.tsx

====================================================
3. PERMISSION STANDARD (FROZEN)
====================================================

Permission format (FINAL):

platform.<module>.<resource>.<action>
tenant.<module>.<resource>.<action>

Examples:
platform.users.users.read
platform.settings.dictionary.currency.update
tenant.packages.subscription.change

RULES:
- NO generic "view" permission
- READ = visibility + data access
- WRITE actions REQUIRE READ implicitly
- Backend MUST auto-enforce READ when WRITE is present
- Frontend MUST reflect the same logic

====================================================
4. MENU SYSTEM — SAP STYLE (NO NESTED SIDEBAR)
====================================================

- Sidebar is FLAT
- NO submenus in sidebar
- ALL hierarchy is expressed via:
  - tabs
  - subTabs
  - URL query params

Example:
 /admin/settings?tab=dictionaries&subTab=currency

Rules:
- Parent menu is visible if ANY child permission exists
- Parent menu navigates to FIRST allowed tab
- Tabs and subTabs are permission-guarded individually
- Sidebar NEVER toggles, NEVER collapses

menu.definitions.ts must contain:
- id
- label
- basePath
- tabs[] with permission
- NO children arrays

====================================================
5. MENU → ROUTE → PERMISSION FLOW (MANDATORY)
====================================================

Login →
  Fetch permissions →
    Compute visible menu →
      Determine firstAllowedRoute →
        Redirect ONCE →
          Stable state

NO redirect loops allowed.

AccessDenied page is TERMINAL:
- Only Logout is allowed
- No retry
- No redirect back

====================================================
6. PERMISSION PREVIEW ENGINE
====================================================

Implement a deterministic engine:

INPUT:
- Role permissions
- Menu registry
- Route registry

OUTPUT:
- Visible menus
- Visible tabs
- Allowed routes
- Forbidden routes

Used in:
- Role editor ("What will user see?")
- Audit diff
- Approval preview

====================================================
7. ROLE MANAGEMENT (BANK-GRADE)
====================================================

Role creation & update:
- Full replace diff (add/remove)
- Atomic transaction
- Versioned (optimistic locking)

4-EYES PRINCIPLE:
- Role changes → PENDING_APPROVAL
- Cannot self-approve
- Approvers defined by permission:
  platform.approvals.roles.approve

Rejected changes:
- Not applied
- Fully audited

====================================================
8. APPROVALS / NOTIFICATIONS / AUDIT
====================================================

ALL approvals:
- Go to Approvals main menu
- Never embedded inside IAM pages

Notifications:
- In-app
- Email (optional)
- Triggered on:
  - Pending approval
  - Approved
  - Rejected

Audit timeline:
- before
- after
- actor
- approver
- timestamp
- risk score

====================================================
9. SECURITY & COMPLIANCE
====================================================

- Zero-permission user CANNOT login
- No menu = no system access
- URL manipulation MUST fail backend-side
- Guards enforced on EVERY route

SOC2 / ISO:
- Every permission change is auditable
- Export actions are HIGH RISK
- High-risk exports require approval

====================================================
10. LIST ENGINE (REUSABLE)
====================================================

Search / Filter / Sort / Pagination:
- Single shared engine
- Backend validates all params
- Export respects current filters

Rows per page:
- FIXED (10 / 15)
- No user-controlled pageSize

====================================================
11. DELETE PLAN (SIMPLIFICATION)
====================================================

REMOVE:
- Duplicate menu engines
- Multiple permission helpers
- Any file inferring permissions from UI
- Any nested sidebar logic

KEEP ONLY:
- permission-slugs.ts
- menu.definitions.ts
- usePermissions
- useMenu
- ProtectedRoute

====================================================
12. FINAL ACCEPTANCE CRITERIA
====================================================

System is ACCEPTED ONLY IF:
- No access-denied redirect loops
- Menu clicks always navigate correctly
- Sub-permission opens parent correctly
- Admin NEVER sees tenant UI
- Tenant NEVER sees admin UI
- Approval, notification, audit are consistent

DO NOT deliver partial fixes.
DO NOT add new abstractions unnecessarily.
FINALIZE and FREEZE.

END OF PROMPT
