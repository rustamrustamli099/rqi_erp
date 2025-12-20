# Permission Inheritance Matrix

This matrix defines how permissions propagate and interact across different layers of the application.

## 1. Menu Visibility Inheritance

| Scenario | Parent Permission | Child Permission | Result |
| :--- | :--- | :--- | :--- |
| **Standard** | Granted | Granted | **Visible** (Both navigable) |
| **Partial (Child Access)** | **Missing** | Granted | **Visible** (Parent visible as *Group Header*, Child navigable) |
| **Partial (Parent Access)** | Granted | Missing | **Visible** (Parent navigable, Child HIDDEN) |
| **No Access** | Missing | Missing | **HIDDEN** (Entire tree removed) |

**Key Rule:** A parent menu never hides if at least one child is visible. It degrades from a "Link" to a "Label/Group".

## 2. Action Inheritance (Buttons)

*   **No Implicit Inheritance:** `read` permission on a resource does NOT imply `create`, `update`, or `delete`.
*   **Atomic Checks:** Each button checks its specific permission slug.
    *   View Button -> `resource.read`
    *   Edit Button -> `resource.update`
    *   Delete Button -> `resource.delete`

## 3. Route Inheritance

*   **Gatekeeping:** Router uses `ProtectedRoute` to enforce security.
*   **Independence:** Route hierarchy does not imply permission hierarchy.
    *   Access to `/admin/users` does NOT grant access to `/admin/users/:id/edit`.
    *   Access to `/admin/users/:id/edit` DOES imply the user can conceptually "access" the module, but technically they could hit the edit URL directly without list access (though rare UX).

## 4. Impersonation Inheritance rules

| Actor | Context | Effective Permissions | Owner Bypass |
| :--- | :--- | :--- | :--- |
| **Admin** | Normal Login | Admin's Permissions | **Active** (if isOwner=true) |
| **Admin** | Impersonating **User** | **User's Permissions** | **DISABLED** |
| **User** | Normal Login | User's Permissions | Disabled |

**Critical Security Rule:** When impersonating, the Admin MUST NOT be able to do anything the target User cannot do. This ensures accurate debugging and prevents accidental privilege escalation during support sessions.

## 5. Scoping (Platform vs Tenant)

*   **Platform Scope:** `platform.*` permissions apply only to System Management (Super Admin) context.
*   **Tenant Scope:** `tenant.*` permissions apply only to the specific Tenant Context (`activeTenantId`).
*   **Isolation:** A user with `platform.tenants.read` cannot see `tenant.invoices.read` data unless they explicitly impersonate or switch context (if architecture allows dual-context, which ours currently separates via `activeTenantType`).
