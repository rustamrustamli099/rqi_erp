# UX Visibility Policy

This document defines the rules for handling UI elements that a user does not have permission to access.

## 1. General Principles
The system prioritizes **Clarity** and **Focus**. Users should effectively see only what they can use. However, for discoverability of premium features, some elements may be shown but disabled.

## 2. Modes

### A. HIDDEN (Default)
**Behavior:** The element is completely removed from the DOM.
**Use Case:** 
- Standard daily operations.
- Data users are not authorized to see (e.g., specific reports, sensitive fields).
- Administrative actions for regular users (Delete, Configure).
**Rationale:** Reduces cognitive load and prevents clutter. "If I can't use it, don't show it."

### B. DISABLED
**Behavior:** The element is visible but non-interactive (grayed out). 
- Must include a tooltip explaining WHY: *"You do not have permission to perform this action."*
- For features, may include a "Contact Admin" or "Upgrade" CTA.
**Use Case:**
- **Upsell Opportunities:** Features available in higher tiers/plans.
- **Discoverability:** System Console tools (to show capabilities exist).
- **Workflow Continuity:** Steps in a process that others must complete (e.g., "Approve" button for a requester).

## 3. Component Specific Rules

### Menus (Sidebar)
*   **Rule:** **HIDDEN** by default.
*   **Exception:** If a menu group is required for context but user only has access to a deep child, the parent group remains visible but is not navigable (acts as a folder).

### Buttons / Actions
*   **Create/Edit/Delete:** **HIDDEN** if user lacks permission.
*   **Workflow Actions (Approve/Reject):** **DISABLED** if it is not the user's turn or role, to indicate the workflow step exists.

### Routes / Pages
*   **Access Denied:** Redirect to `/403` (Forbidden). Never show a blank page or a disabled page.

## 4. Implementation Guide

```typescript
// Correct Usage
{can('create') && <Button>Create</Button>}

// Incorrect Usage (unless specific 'disabled' requirement exists)
<Button disabled={!can('create')}>Create</Button>
```
