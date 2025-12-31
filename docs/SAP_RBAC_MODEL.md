# SAP-GRADE MULTI-TENANT ROLE MODEL (PFCG EQUIVALENT)

> **PHASE 5 DELIVERABLE**
> This document defines the Target State architecture for the RBAC system.
> It enforces strict separation of concerns, explicit scoping, and rule-based assignment.

## 1. Conceptual Model (Entity-Relationship)

The model follows the **SAP PFCG (Profile Generator)** pattern adapted for modern Multi-Tenancy.

### Core Entities

1.  **Identity (User)**: A human or service account. Has NO permissions directly.
2.  **Container (Tenant)**: An isolation boundary.
3.  **Definition (Role)**: A named collection of capabilities (Permissions).
    *   *Global Role*: Defined by System, available to all Tenants (Template).
    *   *Local Role*: Defined by Tenant, specific to that Tenant.
4.  **Assignment (UserRoleAssignment)**: The ONLY link between User and Role.
    *   Must be **SCOPED**.
    *   A User can have the *Same Role* in *Different Scopes*.

### Relationships

*   **User ↔ Tenant**: M:N (User belongs to multiple tenants).
*   **Role ↔ Permission**: 1:N (Direct mapping).
*   **Role ↔ Role (Composite)**: M:N (Role Hierarchy / Composites).
*   **User ↔ Role (Assignment)**: M:N (via Assignment Entity).

---

## 2. Database Schema Sketch

### `Tenant`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `slug` | String | Unique identifier (e.g., 'acme-corp') |
| `name` | String | Display name |
| `status` | Enum | ACTIVE, SUSPENDED |

### `User`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `email` | String | Unique Login |
| `is_system_admin` | Bool | **Emergency Break-Glass ONLY**. Do not use for regular logic. |

### `Role`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `slug` | String | Unique Key (e.g., 'finance_manager') |
| `name` | String | Display Name |
| `owner_type` | Enum | `SYSTEM` (Global Template), `TENANT` (Local Custom) |
| `owner_tenant_id` | UUID | Nullable. MUST be set if `owner_type` == `TENANT`. MUST be NULL if `owner_type` == `SYSTEM`. |
| `parent_role_id` | UUID | For inheritance (template extension) - Optional |

*Invariant: if owner_type == TENANT then owner_tenant_id IS NOT NULL*

### `RolePermission` (Junction)
| Field | Type | Description |
| :--- | :--- | :--- |
| `role_id` | UUID | FK -> Role |
| `permission_slug`| String | The raw capability string (e.g., 'invoice.create') |
*Constraint: Unique(role_id, permission_slug)*

### `CompositeRole` (Junction)
| Field | Type | Description |
| :--- | :--- | :--- |
| `parent_role_id` | UUID | FK -> Role (The Composite) |
| `child_role_id` | UUID | FK -> Role (The Single Role) |
*Constraint: No Cycles Allowed*

### `UserRoleAssignment` (THE LAW)
This table is the Source of Truth for "Who can do what where".

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK -> User |
| `role_id` | UUID | FK -> Role |
| `scope_type` | Enum | `SYSTEM` (Global), `TENANT` (Org), `UNIT` (Dept) |
| `scope_id` | UUID | Nullable. The ID of the Tenant/Unit. |
| `valid_from` | Date | Optional: Time-based assignment |
| `valid_to` | Date | Optional: Time-based assignment |

*Constraint: Unique(user_id, role_id, scope_type, scope_id)*

---

## 3. Invariants (Forbidden States)

1.  **Orphan Assignments**: A `UserRoleAssignment` MUST NEVER have a null `scope_type`.
2.  **Direct Permissions**: A `User` table/entity MUST NEVER have a `permissions` column.
3.  **Explicit Ownership**: No implicit "null means global". `owner_type` MUST be explicit.
4.  **Leakage**: A Tenant-Owned Role (`owner_type = TENANT`) MUST NEVER be assigned to a user in a different Tenant Scope.

---

## 4. Examples

### Scenario A: Multi-Tenant Consultant
User `Alice` is a generic generic `User` in the system.

1.  **Scope 1: Acme Corp (Tenant A)**
    *   Role: `Finance Manager` (Standard Global Role)
    *   Assignment: `{ user: Alice, role: FinanceManager, scope_type: TENANT, scope_id: TenantA_ID }`
    *   *Result:* Alice can Access Finance in Acme Corp.

2.  **Scope 2: Beta Ltd (Tenant B)**
    *   Role: `Auditor` (Custom Role defined by Beta Ltd)
    *   Assignment: `{ user: Alice, role: Auditor, scope_type: TENANT, scope_id: TenantB_ID }`
    *   *Result:* Alice can View Logs in Beta Ltd.

*Effect:* Alice logs in. If she selects context "Acme Corp", she has Finance powers. If she switches to "Beta Ltd", she has Auditor powers.

### Scenario B: Hierarchy Scope
User `Bob` in `Acme Corp`.

1.  **Global Assign**:
    *   Assignment: `{ user: Bob, role: Employee, scope_type: TENANT, scope_id: TenantA_ID }`
    *   *Result:* Bob is "Employee" everywhere in Acme.

2.  **Unit Assign**:
    *   Assignment: `{ user: Bob, role: TeamLead, scope_type: UNIT, scope_id: IT_Dept_ID }`
    *   *Result:* Bob is "TeamLead" ONLY when acting within IT Dept context.

---

## 5. Intentionally Not Implemented (Phase 5)

*   **Permission Evaluation Engine**: The logic that says "Does User U have Permission P in Scope S?" is NOT in this phase.
*   **Resolver Integration**: The Navigation Resolver currently uses a mock/simplified list. It is NOT yet connected to this DB schema.
*   **UI Management**: No screens to creating roles or assigning users yet.

## 6. Migration Strategy

1.  Create Tables (Prisma Migration).
2.  Migrate existing `User.permissions` or `User.role` column to `UserRoleAssignment` table.
3.  Update `User` entity to remove legacy fields.
